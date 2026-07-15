param(
    [switch]$SkipBuild,
    [switch]$AllowDrafts,
    [switch]$StrictMetadata
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Normalize-Scalar {
    param([AllowNull()][string]$Value)

    if ($null -eq $Value) {
        return $null
    }

    $normalized = $Value.Trim()
    if ($normalized.Length -ge 2) {
        $first = $normalized[0]
        $last = $normalized[$normalized.Length - 1]
        if (($first -eq "'" -and $last -eq "'") -or ($first -eq '"' -and $last -eq '"')) {
            $normalized = $normalized.Substring(1, $normalized.Length - 2)
        }
    }

    return $normalized
}

function Normalize-Alias {
    param([string]$Alias)

    $value = Normalize-Scalar -Value $Alias
    if ([string]::IsNullOrWhiteSpace($value)) {
        return $null
    }

    if (-not $value.StartsWith("/")) {
        $value = "/$value"
    }
    if (-not $value.EndsWith("/")) {
        $value = "$value/"
    }

    return $value.ToLowerInvariant()
}

function Get-FrontMatterData {
    param(
        [string]$Path,
        [string]$RepoRoot
    )

    $lines = Get-Content -LiteralPath $Path
    $relativePath = $Path.Substring($RepoRoot.Length + 1).Replace("\", "/")

    if ($lines.Count -lt 3 -or $lines[0].Trim() -ne "---") {
        return [pscustomobject]@{
            Path         = $relativePath
            FileName     = [System.IO.Path]::GetFileName($Path)
            HasFrontMatter = $false
            Draft        = $null
            Summary      = $null
            Description  = $null
            Aliases      = @()
        }
    }

    $frontMatterEnd = -1
    for ($i = 1; $i -lt $lines.Count; $i++) {
        if ($lines[$i].Trim() -eq "---") {
            $frontMatterEnd = $i
            break
        }
    }

    if ($frontMatterEnd -lt 0) {
        return [pscustomobject]@{
            Path         = $relativePath
            FileName     = [System.IO.Path]::GetFileName($Path)
            HasFrontMatter = $false
            Draft        = $null
            Summary      = $null
            Description  = $null
            Aliases      = @()
        }
    }

    $frontMatter = $lines[1..($frontMatterEnd - 1)]
    $draft = $null
    $summary = $null
    $description = $null
    $aliases = New-Object System.Collections.Generic.List[string]

    for ($i = 0; $i -lt $frontMatter.Count; $i++) {
        $line = $frontMatter[$i]

        if ($line -match "^\s*draft\s*:\s*(.+)\s*$") {
            $draftText = Normalize-Scalar -Value $Matches[1]
            if ($null -ne $draftText) {
                $lower = $draftText.ToLowerInvariant()
                if ($lower -eq "true") {
                    $draft = $true
                } elseif ($lower -eq "false") {
                    $draft = $false
                }
            }
            continue
        }

        if ($line -match "^\s*summary\s*:\s*(.*)$") {
            $summary = Normalize-Scalar -Value $Matches[1]
            continue
        }

        if ($line -match "^\s*description\s*:\s*(.*)$") {
            $description = Normalize-Scalar -Value $Matches[1]
            continue
        }

        if ($line -match "^\s*aliases\s*:\s*(.*)$") {
            $tail = $Matches[1].Trim()

            if (-not [string]::IsNullOrWhiteSpace($tail)) {
                if ($tail -match "^\[(.*)\]$") {
                    $inline = $Matches[1]
                    foreach ($item in $inline.Split(",")) {
                        $alias = Normalize-Alias -Alias $item
                        if ($null -ne $alias) {
                            [void]$aliases.Add($alias)
                        }
                    }
                } else {
                    $alias = Normalize-Alias -Alias $tail
                    if ($null -ne $alias) {
                        [void]$aliases.Add($alias)
                    }
                }
                continue
            }

            for ($j = $i + 1; $j -lt $frontMatter.Count; $j++) {
                $nextLine = $frontMatter[$j]
                if ($nextLine -match "^\s*-\s*(.+?)\s*$") {
                    $alias = Normalize-Alias -Alias $Matches[1]
                    if ($null -ne $alias) {
                        [void]$aliases.Add($alias)
                    }
                    $i = $j
                    continue
                }
                if ([string]::IsNullOrWhiteSpace($nextLine)) {
                    $i = $j
                    continue
                }
                break
            }
        }
    }

    return [pscustomobject]@{
        Path           = $relativePath
        FileName       = [System.IO.Path]::GetFileName($Path)
        HasFrontMatter = $true
        Draft          = $draft
        Summary        = $summary
        Description    = $description
        Aliases        = $aliases.ToArray()
    }
}

function Get-MarkdownMathIssues {
    param(
        [string]$Path,
        [string]$RepoRoot
    )

    $issues = New-Object System.Collections.Generic.List[string]
    $lines = Get-Content -LiteralPath $Path -Encoding UTF8
    $relativePath = $Path.Substring($RepoRoot.Length + 1).Replace("\", "/")

    $inFrontMatter = $lines.Count -gt 0 -and $lines[0].Trim() -eq "---"
    $inFence = $false
    $fenceCharacter = $null
    $fenceLength = 0
    $inDisplayMath = $false
    $displayMathStart = 0
    $inBracketDisplayMath = $false
    $bracketDisplayMathStart = 0

    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        $trimmed = $line.Trim()
        $lineNumber = $i + 1

        if ($inFrontMatter) {
            if ($i -gt 0 -and $trimmed -eq "---") {
                $inFrontMatter = $false
            }
            continue
        }

        if (-not $inDisplayMath -and -not $inBracketDisplayMath -and $line -match '^\s*(`{3,}|~{3,})') {
            $marker = $Matches[1]
            if (-not $inFence) {
                $inFence = $true
                $fenceCharacter = $marker[0]
                $fenceLength = $marker.Length
            } elseif ($marker[0] -eq $fenceCharacter -and $marker.Length -ge $fenceLength) {
                $inFence = $false
                $fenceCharacter = $null
                $fenceLength = 0
            }
            continue
        }

        if ($inFence) {
            continue
        }

        if ($trimmed -eq '$$') {
            $inDisplayMath = -not $inDisplayMath
            if ($inDisplayMath) {
                $displayMathStart = $lineNumber
            }
            continue
        }

        if (-not $inDisplayMath -and $trimmed -eq '\[') {
            $inBracketDisplayMath = $true
            $bracketDisplayMathStart = $lineNumber
            continue
        }

        if (-not $inDisplayMath -and $trimmed -eq '\]') {
            if (-not $inBracketDisplayMath) {
                [void]$issues.Add("Display math closes with '\]' without an opening delimiter: ${relativePath}:$lineNumber")
            }
            $inBracketDisplayMath = $false
            continue
        }

        if ($inDisplayMath -or $inBracketDisplayMath) {
            if ($line.Contains('<')) {
                [void]$issues.Add("Math contains a literal '<' that the browser can parse as HTML; use '\lt': ${relativePath}:$lineNumber")
            } elseif ($trimmed -match '^[=-]+$') {
                [void]$issues.Add("Math block has a standalone Markdown setext marker: ${relativePath}:$lineNumber")
            } elseif ($line -match '^\s*>') {
                [void]$issues.Add("Math block starts with a Markdown blockquote marker: ${relativePath}:$lineNumber")
            } elseif ($line -match '^\s*#{1,6}(\s|$)') {
                [void]$issues.Add("Math block starts with a Markdown heading marker: ${relativePath}:$lineNumber")
            } elseif ($line -match '^\s*([-+*]|\d+[.)])\s+') {
                [void]$issues.Add("Math block starts with a Markdown list marker: ${relativePath}:$lineNumber")
            } elseif ($line -match '^\s*(`{3,}|~{3,})') {
                [void]$issues.Add("Math block starts with a Markdown fence marker: ${relativePath}:$lineNumber")
            } elseif ($line -match '^\s*<[/!?A-Za-z]') {
                [void]$issues.Add("Math block starts like a raw HTML block: ${relativePath}:$lineNumber")
            }
            continue
        }

        $withoutInlineCode = [regex]::Replace($line, '(`+).*?\1', '')
        $inlineMathPatterns = @(
            '(?<!\\)\$\$(.*?)(?<!\\)\$\$',
            '\\\[(.*?)\\\]',
            '(?<![\\$])\$(?!\$)(.*?)(?<!\\)\$(?!\$)',
            '\\\((.*?)\\\)'
        )
        foreach ($pattern in $inlineMathPatterns) {
            foreach ($match in [regex]::Matches($withoutInlineCode, $pattern)) {
                if ($match.Groups[1].Value.Contains('<')) {
                    [void]$issues.Add("Math contains a literal '<' that the browser can parse as HTML; use '\lt': " + $relativePath + ":" + $lineNumber)
                }
            }
        }

        if ($withoutInlineCode -match '\\(?:text|mathrm|operatorname)\{[^}]*\$(?=[^}]*\})') {
            [void]$issues.Add("Inline math contains a nested dollar delimiter: ${relativePath}:$lineNumber")
        }

        $singleDollarCount = ([regex]::Matches($withoutInlineCode, '(?<![\\$])\$(?!\$)')).Count
        if (($singleDollarCount % 2) -ne 0) {
            [void]$issues.Add("Inline math has an unmatched dollar delimiter: ${relativePath}:$lineNumber")
        }
    }

    if ($inDisplayMath) {
        [void]$issues.Add("Display math opened with '$$' is not closed: ${relativePath}:$displayMathStart")
    }

    if ($inBracketDisplayMath) {
        [void]$issues.Add("Display math opened with '\[' is not closed: ${relativePath}:$bracketDisplayMathStart")
    }

    return $issues.ToArray()
}

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $repoRoot

$errors = New-Object System.Collections.Generic.List[string]
$warnings = New-Object System.Collections.Generic.List[string]

Write-Host "Running prepublish checks in $repoRoot"

if (-not $SkipBuild) {
    $hugo = Get-Command hugo -ErrorAction SilentlyContinue
    if ($null -eq $hugo) {
        [void]$errors.Add("hugo command not found in PATH.")
    } else {
        Write-Host "[Build] hugo -D"
        & hugo -D *> $null
        if ($LASTEXITCODE -ne 0) {
            [void]$errors.Add("hugo -D failed.")
        }
    }
} else {
    Write-Host "[Build] skipped (-SkipBuild)"
}

$contentRoot = Join-Path $repoRoot "content"
$contentFiles = Get-ChildItem -LiteralPath $contentRoot -Recurse -File -Filter "*.md"

foreach ($file in $contentFiles) {
    foreach ($issue in (Get-MarkdownMathIssues -Path $file.FullName -RepoRoot $repoRoot)) {
        [void]$errors.Add($issue)
    }
}

$pages = foreach ($file in $contentFiles) {
    Get-FrontMatterData -Path $file.FullName -RepoRoot $repoRoot
}

$missingFrontMatter = @($pages | Where-Object { -not $_.HasFrontMatter })
if ($missingFrontMatter.Count -gt 0) {
    foreach ($item in $missingFrontMatter) {
        [void]$warnings.Add("No YAML front matter: $($item.Path)")
    }
}

if (-not $AllowDrafts) {
    $draftPages = @($pages | Where-Object { $_.Draft -eq $true })
    if ($draftPages.Count -gt 0) {
        foreach ($item in $draftPages) {
            [void]$errors.Add("Draft page: $($item.Path)")
        }
    }
}

$pagesForMetadata = @(
    $pages | Where-Object {
        $_.FileName -ne "_index.md" -and $_.Draft -ne $true
    }
)

foreach ($item in $pagesForMetadata) {
    if ([string]::IsNullOrWhiteSpace($item.Summary)) {
        if ($StrictMetadata) {
            [void]$errors.Add("Missing summary: $($item.Path)")
        } else {
            [void]$warnings.Add("Missing summary: $($item.Path)")
        }
    }
    if ([string]::IsNullOrWhiteSpace($item.Description)) {
        if ($StrictMetadata) {
            [void]$errors.Add("Missing description: $($item.Path)")
        } else {
            [void]$warnings.Add("Missing description: $($item.Path)")
        }
    }
}

$aliasOwners = @{}
foreach ($item in $pages) {
    foreach ($alias in $item.Aliases) {
        if (-not $aliasOwners.ContainsKey($alias)) {
            $aliasOwners[$alias] = New-Object System.Collections.Generic.List[string]
        }
        [void]$aliasOwners[$alias].Add($item.Path)
    }
}

foreach ($entry in $aliasOwners.GetEnumerator()) {
    if ($entry.Value.Count -gt 1) {
        $owners = ($entry.Value | Sort-Object -Unique) -join ", "
        [void]$errors.Add("Duplicate alias '$($entry.Key)' found in: $owners")
    }
}

Write-Host ""
if ($warnings.Count -gt 0) {
    Write-Host "Warnings ($($warnings.Count)):"
    foreach ($warning in $warnings) {
        Write-Host "  - $warning"
    }
    Write-Host ""
}

if ($errors.Count -gt 0) {
    Write-Host "Errors ($($errors.Count)):"
    foreach ($err in $errors) {
        Write-Host "  - $err"
    }
    Write-Host ""
    Write-Host "Result: FAIL"
    exit 1
}

Write-Host "Result: PASS"
exit 0
