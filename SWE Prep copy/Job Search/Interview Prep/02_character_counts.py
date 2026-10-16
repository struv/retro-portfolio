"""Python session 2: build a frequency dictionary.

Continue here after the optional basics warm-up. This exercise connects to
Valid Anagram (problem 03) in your offline interview practice pack.

TASK
Implement character_counts(text). Return a dictionary mapping each character
to the number of times it appears. Include spaces and punctuation. Uppercase
and lowercase characters are different. Empty input should return {}.

Examples:
    character_counts("aab") == {"a": 2, "b": 1}
    character_counts("banana") == {"b": 1, "a": 3, "n": 2}
    character_counts("") == {}

Use a dictionary and a loop. For this attempt, do not use Counter or repeatedly
call text.count(). Aim to visit each input character once. Dictionary key order
does not matter for this exercise.

Before coding: explain why a set alone cannot keep the information we need.
Then try for about 10 minutes. If stuck, send your attempt and the point where
you got stuck; we'll use a small hint before looking at a complete solution.

Replace the raise line below with your implementation. From Job Search, run:
    python3 "Interview Prep/02_character_counts.py"

After the checks pass, add a case of your own and explain how your dictionary
changes as you process "aab". Then we'll return to the anagram problem.
"""


def character_counts(text: str) -> dict[str, int]:
    freq = {}
    for char in text:
        if char in freq:
            freq[char] += 1
        else:
            freq[char] = 1
    return freq



# CHECKER — Write your solution above. You may add more cases here.
CASES = [
    ("aab", {"a": 2, "b": 1}),
    ("banana", {"b": 1, "a": 3, "n": 2}),
    ("", {}),
    ("x", {"x": 1}),
    ("aaaa", {"a": 4}),
    ("AaA", {"A": 2, "a": 1}),
    ("a a!", {"a": 2, " ": 1, "!": 1}),
    ("åßå", {"å": 2, "ß": 1}),
]


def run_checks() -> int:
    failures = 0
    for text, expected in CASES:
        try:
            actual = character_counts(text)
        except NotImplementedError:
            print("This is a starter: implement character_counts first, then rerun.")
            return 1
        except Exception as error:
            failures += 1
            print(f"FAIL {text!r}: {type(error).__name__}: {error}")
            continue
        passed = (
            type(actual) is dict
            and actual == expected
            and all(type(count) is int for count in actual.values())
        )
        if passed:
            print(f"PASS {text!r} -> {actual!r}")
        else:
            failures += 1
            print(f"FAIL {text!r}: expected {expected!r}, got {actual!r}")
    if failures:
        print(f"\n{failures} check(s) need attention. Revise and try again.")
        return 1
    print("\nAll provided checks passed. Add one case and explain your approach.")
    return 0


if __name__ == "__main__":
    raise SystemExit(run_checks())
