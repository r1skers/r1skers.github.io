---
date: '2025-11-08T10:17:00+09:00'
draft: false
title: 'UART commmuniation analyse in vivado'
tags: ["basic", "markdown","UART"]
categories: ["Promethean Fire", "Fireside Notes"]
---

# [Important] Key Concept
1.The reason why we have to calculate (Frequency / Baud Rate) - [See Section 2.1.1](#211)<br>
2.The reason why we use data_valid here - [See Section 2.1.1](#211)<br>
***
# 1.Description
Short overview: minimal UART RX + simple command parser for FPGA.

- Goal: show a synthesizable UART receiver (`uart_rx`), a byte-oriented `command_parser` that recognizes "ON"/"OFF", and a small `fpga_top` that wires them.
- Key idea: `uart_rx` asserts `data_valid` when a full byte is ready; the parser samples only on that strobe.

# 2.Detailed Analysis
## 2.1.uart_rx.v
<a id="211"></a>
This section contains `uart_rx` (UART receiver) — very short summary:

- Purpose: sample `rxd`, detect start, read 8 data bits, check stop, and assert `data_valid` with `data_out`.
- Tuning: set `CLKS_PER_BIT = ClockHz / BaudRate` so sampling hits bit centers.
- Ports: `clk`, `rxd`, `data_out[7:0]`, `data_valid`.

Notes: FSM = IDLE → START → DATA → STOP. If stop bit fails, data_valid is not asserted (frame error).
{{< details "2.1.1" open >}} 
```v
// Module: UART Receiver
// Function: Convert serial RXD signal to 8-bit parallel data_out 
module uart_rx(
    input             clk,        
    input             rxd,        
    output reg [7:0]  data_out,   
    output reg        data_valid  
    );

    parameter CLKS_PER_BIT = 5208;
    // Calculate (Clock Frequency / Baud Rate): For example, with FPGA clock at 50MHz and UART at 9600 baud,
    // FPGA needs 5208 clock cycles to receive one UART bit
    // Explanation (Key Concept #1): CLKS_PER_BIT = ClockFrequency / BaudRate. This value sets how
    // many system clock cycles correspond to one UART bit. Use it to time sampling so the receiver
    // samples near the middle of each bit period for best reliability.
    
    localparam STATE_IDLE = 0;
    localparam STATE_START = 1;
    localparam STATE_DATA = 2;
    localparam STATE_STOP = 3;
    // It's better to decide how many states we need.Here,We need four.
    reg [2:0] state = STATE_IDLE;
    // Initialize state register to hold 4 possible states (IDLE, START, DATA, STOP)
    reg [12:0] clk_counter = 0;
    // Clock counter, must be wide enough to hold 5208 cycles (needs 13 bits)
    reg [3:0] bit_counter = 0;
    // Counts received data bits (0 to 7, one byte)
    reg [7:0] data_reg = 0;
    // Temporary register to hold incoming data bits
```
{{< /details >}}

{{< details "2.1.2" open >}}
```mermaid
graph TD
    A[STATE_IDLE] -- "rxd == 0 (Start bit detected)" --> B(STATE_START)
    A -- "rxd == 1 (Line idle)" --> A

    B -- "Wait half bit time" --> B_check{Sample at middle of start bit}
    B_check -- "rxd == 0 (Confirmed)" --> C[STATE_DATA]
    B_check -- "rxd == 1 (Glitch/Noise)" --> A

    C -- "Wait one bit time (Sample data)" --> C_check{8 bits received?}
    C_check -- "No (bit_counter < 7)" --> C
    C_check -- "Yes (bit_counter == 7)" --> D[STATE_STOP]

    D -- "Wait one bit time" --> D_check{Check stop bit: rxd == 1?}
    
    D_check -- "Yes (Data valid)<br>Output data & set valid=1" --> A
    D_check -- "No (Frame error)<br>Keep valid=0" --> A
```
```v
always @(posedge clk) begin
    // Key Concept #2: default data_valid to 0 at each clock; assert it only when a full,
    // valid byte has been captured. Downstream modules should sample `data_out` only when
    // `data_valid` is high (one-cycle strobe).
    data_valid <= 0; 

        case(state)
            STATE_IDLE: begin
                if(rxd == 0) begin
                    state <= STATE_START;
                    clk_counter <= 0; 
                end
            end
            
            STATE_START: begin 
                // CLKS_PER_BIT / 2
                // Explanation: sample the start bit at half a bit time to confirm a valid start and
                // align subsequent samples to the center of each data bit.
                if(clk_counter == (CLKS_PER_BIT / 2)) begin
                    if(rxd == 0) begin 
                        state <= STATE_DATA; 
                        clk_counter <= 0; 
                        bit_counter <= 0;   
                    end else begin
                        state <= STATE_IDLE;
                    end
                end else begin
                    clk_counter <= clk_counter + 1;
                end
            end
            
            STATE_DATA: begin 
                if(clk_counter == CLKS_PER_BIT - 1) begin
                    clk_counter <= 0;
                    data_reg[bit_counter] <= rxd; 
                    
                    if(bit_counter == 7) begin 
                        state <= STATE_STOP; 
                    end else begin
                        bit_counter <= bit_counter + 1; 
                    end
                end else begin
                    clk_counter <= clk_counter + 1;
                end
            end
            
            STATE_STOP: begin 
                if(clk_counter == CLKS_PER_BIT - 1) begin
                    if(rxd == 1) begin 
                        data_out <= data_reg; 
                        data_valid <= 1; 
                    end
                    state <= STATE_IDLE; 
                end else begin
                    clk_counter <= clk_counter + 1;
                end
            end
            
            default:
                state <= STATE_IDLE;
        endcase
    end
    
```
{{< /details >}}

## 2.2.command_parser.v
<a id="222"></a>
Short summary of `command_parser`:

- Purpose: simple FSM that reads bytes on `data_valid` and recognizes "ON" / "OFF" to set `led_out`.
- Ports: `clk`, `rst`, `data_in[7:0]`, `data_valid`, `led_out`.
- FSM: IDLE → GOT_O → GOT_OF. Uses ASCII compares (e.g., `8'h4F` for 'O').
{{< details "2.2.1" open >}} 

```v
module command_parser(
    input             clk,
    input             rst,        
    input      [7:0]  data_in,    
    input             data_valid, 
    output reg        led_out     
    );

    
    localparam ASCII_O = 8'h4F;
    localparam ASCII_N = 8'h4E;
    localparam ASCII_F = 8'h46;
    
   
    localparam STATE_IDLE = 0;   
    localparam STATE_GOT_O = 1; 
    localparam STATE_GOT_OF = 2; 

    reg [1:0] state = STATE_IDLE;

```
{{< /details >}}

{{< details "2.2.2" open >}} 
```mermaid
graph TD
    A(Current: STATE_IDLE) -- "Received new char 'O'" --> B(Go to: STATE_GOT_O)
    A -- "Received any char *except* 'O'" --> A(Stay in: STATE_IDLE)
```  
```mermaid
graph TD
    B(Current: STATE_GOT_O) -- "Received 'N' (Action: Turn LED ON)" --> A(Go to: STATE_IDLE)
    B -- "Received new char 'F'" --> C(Go to: STATE_GOT_OF)
    B -- "Received new char 'O'" --> B(Stay in: STATE_GOT_O)
    B -- "Received other (Invalid char)" --> A(Go to: STATE_IDLE)
```  
```mermaid
graph TD
    C(Current: STATE_GOT_OF) -- "Received 'F' (Action: Turn LED OFF)" --> A(Go to: STATE_IDLE)
    C -- "Received new char 'O'" --> B(Go to: STATE_GOT_O)
    C -- "Received other (Invalid char)" --> A(Go to: STATE_IDLE)
```  
```v
always @(posedge clk) begin
        if(rst) begin
            led_out <= 0; 
            state <= STATE_IDLE; 
        
        end else if (data_valid) begin 
            case(state)
                STATE_IDLE: begin
                    if (data_in == ASCII_O) begin
                        state <= STATE_GOT_O; 
                    end
                end
                
                STATE_GOT_O: begin
                    if (data_in == ASCII_N) begin 
                        led_out <= 1; 
                        state <= STATE_IDLE; 
                    end else if (data_in == ASCII_F) begin 
                        state <= STATE_GOT_OF; 
                    end else if (data_in == ASCII_O) begin 
                        state <= STATE_GOT_O; 
                    end else begin
                        state <= STATE_IDLE;
                    end
                end
                
                STATE_GOT_OF: begin
                    if (data_in == ASCII_F) begin
                        led_out <= 0; 
                        state <= STATE_IDLE; 
                    end else if (data_in == ASCII_O) begin 
                        state <= STATE_GOT_O; 
                    end else begin
                        state <= STATE_IDLE; 
                    end
                end
                
                default:
                    state <= STATE_IDLE;
            endcase
        end
    end
```
{{< /details >}}

## 2.3.fpga_top.v
`fpga_top` (very short):

- Purpose: wire `uart_rx` → `command_parser` and expose `led_out`.
- Reminder: tie `CLKS_PER_BIT` to your clock/baud, and add a real reset (`rst`) on hardware.

```v

module fpga_top(
    input clk_in,  
    input rxd_in,   
    output led_out  
    );
    

    wire [7:0] uart_data; 
    wire       uart_valid; 
    

    uart_rx i_uart_rx (
        .clk        (clk_in),     
        .rxd        (rxd_in),     
        .data_out   (uart_data),  
        .data_valid (uart_valid)  
    );
    

    command_parser i_parser (
        .clk        (clk_in),     
        .rst        (0),          
        .data_in    (uart_data),  
        .data_valid (uart_valid), 
        .led_out    (led_out)     
    );
    
endmodule
```
