---
date: '2026-08-11T00:10:00+09:00'
draft: false
title: 'Error Analysis · Softmax 6: From Observation to Consumer-Specific Mitigation'
summary: "A summation result can pass a tolerance without being correctly rounded, or be perfectly repeatable while every run misses the reference; decisions must separate observations, summaries, policies, and mitigations."
description: "Build the first Softmax failure--consumer--metric--tolerance--mitigation chain, separating accuracy, correct rounding, repeatability, structural failure, and as-yet unmeasured GPU cost."
tags: ["Error Analysis", "Softmax", "Numerical Stability", "Verification"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 6
---

The previous article constructed an explicit summation failure:

\[
q=(1,\underbrace{2^{-24},\ldots,2^{-24}}_{2^{20}\text{ terms}}).
\]

Sequential FP32 returns $1$, while the stored-input reference is $17/16$.
Pairwise, Kahan, and FP64 accumulation recover the reference in this case.

But “this method has less error” is not yet a complete decision. We must first
ask:

- Does the consumer use the denominator, probabilities, loss, or argmax?
- Does it care about absolute error, relative error, or bitwise identity?
- What is the tolerance?
- Is repeatability a separate requirement?
- Is correct rounding a separate requirement?
- Which failures must block, and which should remain warnings?

The mitigation chain should therefore be written as

\[
\boxed{
\text{failure}
\longrightarrow
\text{consumer}
\longrightarrow
\text{metric}
\longrightarrow
\text{tolerance}
\longrightarrow
\text{mitigation}.
}
\]

## 1. A Failure Name Does Not Select a Repair

“Softmax summation has error” is still too broad.

If the consumer cares only about argmax, a tiny relative error in the
denominator may not change the selected class. If it requires a correctly
rounded denominator, the same error has already failed. If the result later
enters a logarithm or cross-entropy, underflow in a tiny probability can become
a structural failure.

The following must therefore be frozen first:

- the actual input to the current stage;
- the local reference;
- the metric;
- the consumer tolerance;
- the execution environment.

Only then does pass/fail have an interpretable meaning.

## 2. A Raw Observation Should Not Contain Pass/Fail

Each reduction run first records facts only:

- case identity;
- input hash;
- implementation and configuration identity;
- environment identity;
- output value and FP32 bit pattern;
- signed, absolute, and relative error;
- the correctly rounded reference bit pattern;
- run index.

This is the raw-observation layer. It should know neither the consumer
tolerance nor which decision rule will later be applied.

If a raw CSV contains only a pass/fail column, it cannot later answer:

- What changes if the tolerance moves from $10^{-6}$ to $10^{-8}$?
- If bitwise repeatability is not required, does accuracy still pass?
- If three results differ but all remain within tolerance, how should they be
  classified?

The original facts must be preserved. Finite, NaN, and positive- or
negative-infinity categories can be derived from the output value; their counts
belong to the summary layer rather than to independent decisions in each raw
record.

## 3. A Summary Aggregates Evidence but Makes No Decision

Multiple runs sharing one case, configuration, and environment produce a
summary containing:

- run count;
- finite and nonfinite counts;
- unique bit-pattern count;
- finite minimum, maximum, mean, and population spread;
- maximum absolute relative error;
- one common correctly rounded reference bit pattern.

A summary answers “what happened,” not “does the consumer accept it?”

For example, suppose all three runs return the same wrong value:

\[
\text{unique bit patterns}=1.
\]

The result is perfectly repeatable but can still miss the reference:

\[
\boxed{
\text{bitwise repeatable}
\not\Rightarrow
\text{accurate}.
}
\]

Conversely, several different bit patterns can all lie within the permitted
error. Accuracy then passes while repeatability fails.

## 4. A Policy Defines What the Consumer Requires

The current experiment's `RunAcceptancePolicy` contains exactly three
consumer-owned requirements:

- maximum permitted absolute relative error;
- whether bitwise repeatability is required;
- whether correctly rounded output is required.

The reduction suite fixes the metric as maximum absolute relative error.
Nonfinite output is a fixed structural failure. The assessment derives failure
and warning codes from the policy rather than allowing the policy to name them
arbitrarily. For the same summary that is not correctly rounded:

- it becomes a failure when correct rounding is required;
- it produces a `not_correctly_rounded` warning when correct rounding is not
  required.

Only after the same policy-free summary is evaluated under a policy do we
obtain an assessment. The current suite registers two policies:

| Policy | Error tolerance | Bitwise repeatability | Correct rounding |
| --- | ---: | --- | --- |
| consumer tolerance | $10^{-6}$ | required | not required |
| correct rounding | $10^{-6}$ | not required | required |

Each policy is preserved as canonical JSON and a `policy_id`. Changing any
requirement creates a new decision identity without rewriting the observation
or summary.

### Large Stress Case: Accuracy Alone Is Enough to Fail

For the $17/16$ stress case, the consumer-tolerance policy requires

\[
\max_r
\left|
\frac{\widehat S^{(r)}-S_q}{S_q}
\right|
\le10^{-6}
\]

and bitwise repeatability.

The assessment is therefore:

| Candidate | Accuracy | Repeatability | Overall |
| --- | --- | --- | --- |
| sequential FP32 | fail | pass | fail |
| fixed pairwise FP32 | pass | pass | pass |
| Kahan FP32 | pass | pass | pass |
| FP64 accumulator | pass | pass | pass |

Sequential summation fails because it exceeds the accuracy tolerance, not
because it is nondeterministic.

### Boundary Control: Tolerance Pass Does Not Imply Correct Rounding

The $t_{\mathrm{source}}=10^{-8},N=6$ control from the fifth article separates
the two policies more sharply. Every candidate has relative error below
$10^{-6}$, and the current CPU runs are bitwise repeatable, but the stored sum
is not always correctly rounded:

| Candidate / layout | Consumer tolerance | Correct rounding |
| --- | --- | --- |
| sequential FP32 / head-first | pass | fail |
| sequential FP32 / tail-first | pass | pass |
| fixed pairwise FP32 / both layouts | pass | fail |
| Kahan FP32 / both layouts | pass | pass |
| FP64 accumulator / both layouts | pass | pass |

“Always return the same value,” “satisfy the consumer tolerance,” and “be
correctly rounded” are three different claims.

## 5. Separate Structural Failure, Accuracy, Correct Rounding, and Repeatability

A clear assessment distinguishes at least the following categories.

### Structural Failure

- NaN;
- positive or negative infinity;
- no finite output;
- an uncertifiable reference;
- a mismatch between an input recipe and its materialized bytes.

These conditions should usually block before a metric is evaluated.

### Accuracy Failure

A finite output exists, but its error relative to the local reference exceeds
the consumer tolerance.

### Correct-Rounding Failure

The output can satisfy the consumer tolerance and be perfectly repeatable while
its bit pattern differs from the correctly rounded local reference. This is a
blocking failure only when the consumer explicitly requires correct rounding;
otherwise it is a warning.

### Repeatability Failure

After fixing the case, configuration, and environment, different runs produce
different bit patterns.

### Non-Blocking Warning

A property is unsatisfied, but the current consumer did not make it a necessary
condition.

A failure code should describe the observed gate rather than guess its cause.
For example, `nonfinite_output` can be recorded directly, but without further
evidence it should not be renamed “overflow” or “GPU race.”

## 6. Preserve Evidence Before and After Mitigation

Some mitigations directly modify the output. Renormalizing a probability vector
again, for example, can restore its sum to $1$. In that case, preserve:

- the pre-mitigation output;
- the original mass residual;
- the post-mitigation output;
- the post-mitigation mass residual;
- the size of the correction;
- the final consumer metric.

Otherwise, “the probabilities now sum to $1$” overwrites the original symptom.

Moreover,

\[
\sum_i\widehat p_i=1
\]

still does not prove

\[
\widehat p=p.
\]

Renormalization can repair a common scale error. It cannot restore tail mass
that has already been lost or undo an incorrect redistribution among
components.

## 7. Different Stages Require Different Mitigations

Return to the Softmax computation graph:

\[
z^*
\longrightarrow
\widehat z
\longrightarrow
\widehat q
\longrightarrow
\widehat S
\longrightarrow
\widehat p.
\]

### Input-Contrast Collapse

If a logit difference disappears across a cast, increase precision before the
lossy quantization or form centered logits in higher precision. A wider
denominator accumulator cannot recover the lost contrast afterward.

### Exp Overflow or Tail Underflow

Subtract-max controls positive-exponent overflow. Log-sum-exp or a fused loss
avoids materializing a zero probability before taking its logarithm. If the
consumer requires an explicitly nonzero tail probability, exp or the output
dtype must be wider.

### Sum/Reduction Rounding

Candidate mitigations include an explicit tree, compensated summation, and a
wider accumulator. Selection depends on the denominator metric, consumer
tolerance, and correct-rounding requirement.

### Division/Output Rounding

Reciprocal, division, or output-storage precision can be increased. Merely
widening the denominator accumulator cannot repair independent division
rounding in each component.

The phrase “Softmax is numerically unstable” becomes actionable only after the
failure is localized to a particular stage.

## 8. Numerical Acceptance Is Not Engineering Optimality

Pairwise, Kahan, and FP64 accumulation all pass the consumer-tolerance policy in
the $17/16$ stress case. In the midpoint control, however, fixed pairwise does
not pass the correct-rounding policy. The candidate set changes with the
consumer requirement.

Choosing among the remaining candidates requires measurements on the target
hardware:

- latency and throughput;
- workspace;
- register and shared-memory use;
- synchronization;
- accumulator throughput;
- the actual reduction graph.

CPU Python timings cannot replace this evidence. Nor can a black-box library
result reveal its internal tree, atomic order, or block size.

The strongest current statement is therefore:

> Three methods are numerically acceptable in the registered $17/16$ case; no
> cost ranking has yet been established.

## 9. Closing This Research Pass

The current pass has:

- localized the first-order budget to denominator summation;
- constructed and validated an FP32 power-tail stress case;
- used binary and decimal midpoint controls to test ties-to-even and to separate
  source-input quantization from reduction error;
- compared sequential, fixed pairwise, Kahan, and FP64 accumulation;
- separated raw observations, summaries, consumer policies, and assessments;
- separated structural failure, accuracy, correct rounding, and repeatability;
- built a failure--consumer--metric--tolerance--mitigation chain;
- established that a CPU numerical prototype provides no GPU performance
  evidence.

In one line:

\[
\boxed{
\text{Mitigation is selected by the consumer, evidence, and cost; it is not an intrinsic property of a failure.}
}
\]

The versioned artifact for the first stress case, together with source code and
tests for the later boundary controls, is preserved in
[Error Atlas](https://github.com/r1skers/error-atlas/tree/main/topics/softmax/experiments).

The next stage will not infer GPU cost from CPU timing. It will first seek a
predictor that depends only on the input and an explicit reduction graph, then
subject that predictor to falsifiable tests on controlled distributions and
real attention data. GPU reduction and the target-hardware accuracy--cost
frontier follow only after that validation.

---

**Previous:** [Softmax 5: How Summation Order Swallows Small Tail Terms](/en/notes/systems/error-analysis/softmax/note-error-softmax-5-summation-stagnation/)

**Return:** [Softmax: From Directional Error to Finite Precision](/en/notes/systems/error-analysis/softmax/)
