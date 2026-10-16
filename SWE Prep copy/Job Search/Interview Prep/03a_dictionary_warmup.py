"""Small dictionary warmup before rebuilding character_counts.

Before coding: what information does a frequency dictionary keep that a set
of its keys would lose?

A frequency dictionary keeps track of the frequency for each entry, whereas a set has a count of one for each entry. There can't be duplicates.

TASK — Two updates, no loop yet.
The counts dictionary already has an "m" key and does not have an "n" key.
Record one more "m" and the first "n", then return the updated dictionary.
Keep any unrelated entries unchanged. An existing count can be zero.

Examples:
    warm_up_counts({"m": 2}) == {"m": 3, "n": 1}
    warm_up_counts({"m": 0}) == {"m": 1, "n": 1}

Use dictionary indexing and assignment. Replace the raise line yourself.
From Job Search, run:
    python3 "Interview Prep/03a_dictionary_warmup.py"

Afterward, try character_counts in the helper area of
03_frequency_map_practice.py from memory for about five focused minutes.
If still stuck, briefly consult your own exercise 02, close it, and rebuild.
Record whether you consulted it; the goal is understanding the two updates.
"""


def warm_up_counts(counts: dict[str, int]) -> dict[str, int]:
    counts["m"] += 1
    counts["n"] = 1
    return counts


# CHECKER — Keep your implementation above; add your own cases here.
CASES = [
    ({"m": 2}, {"m": 3, "n": 1}),
    ({"m": 0}, {"m": 1, "n": 1}),
    ({"m": 4, "!": 2}, {"m": 5, "!": 2, "n": 1}),
]


def run_checks() -> int:
    failures = 0
    for initial, expected in CASES:
        try:
            actual = warm_up_counts(initial.copy())
        except NotImplementedError:
            print("TODO: write the two updates, then rerun.")
            return 1
        except Exception as error:
            print(f"FAIL {initial!r}: {type(error).__name__}: {error}")
            failures += 1
            continue
        if type(actual) is dict and actual == expected:
            print(f"PASS {initial!r} -> {actual!r}")
        else:
            print(f"FAIL {initial!r}: expected {expected!r}, got {actual!r}")
            failures += 1
    if failures:
        return 1
    print("All supplied checks passed. Explain the two updates to your coach.")
    return 0


if __name__ == "__main__":
    raise SystemExit(run_checks())
