"""Optional Python warm-up: functions, comparisons, and loops.

If these feel straightforward, continue with 02_character_counts.py instead.

Start with exercise 1. Work on one function at a time; leave the others alone.
Replace its `raise NotImplementedError(...)` line with your code.

From a terminal in the Job Search folder, run:
    python3 "Interview Prep/01_python_basics.py" 1

Change the final number to 2 or 3 for the next exercise.
Suggested pace: 5 minutes for 1, 5 minutes for 2, 10 minutes for 3.
These are practice targets, not deadlines. Ask for a hint if you get stuck.

A function receives values through parameters and sends a result back with
`return`. For example:

    def echo(word):
        return word

    echo("hello")  # returns "hello"

Indent the function's body with four spaces. `print` displays something;
`return` gives the caller a value. These exercises need return values.

After each exercise, explain your code in your own words and add one test.
Send your attempt to the coach for review before moving on.
"""


# EXERCISE 1 — A function with a numeric result
def minutes_to_seconds(minutes: int) -> int:
    """Return the number of seconds in the given whole number of minutes.

    There are 60 seconds in a minute. Inputs are nonnegative integers.
    Examples: minutes_to_seconds(2) == 120; minutes_to_seconds(0) == 0.

    Python's multiplication operator is `*`.
    The type annotations describe the expected input and output types.
    """
    return minutes * 60


# EXERCISE 2 — A condition with a Boolean result
def is_over_limit(reading: int, limit: int) -> bool:
    """Return True if reading is strictly greater than limit, otherwise False.

    Equal values are NOT over the limit. Inputs may be negative.
    Examples: is_over_limit(21, 20) == True; is_over_limit(20, 20) == False.

    Python comparisons produce Boolean values: True or False.
    You can return a comparison directly or use an if/else statement.
    """
    return reading > limit


# EXERCISE 3 — A list, a loop, and a running count
def count_over_limit(readings: list[int], limit: int) -> int:
    """Count readings that are strictly greater than limit.

    Count every qualifying entry, including repeated values.
    Return 0 for an empty list. Do not modify the input list.
    Examples:
        count_over_limit([18, 24, 20, 27], 20) == 2
        count_over_limit([25, 25], 20) == 2

    Practice a for loop and a running count. You may call is_over_limit.
    """
    count = 0
    for x in readings:
        if x > limit:
            count += 1
    return count


# ---------------------------------------------------------------------------
# CHECKER — You only need to edit the three functions above.
# Add your own examples to the matching list in CASES if you like.
# ---------------------------------------------------------------------------
CASES = {
    1: [
        ((2,), 120),
        ((0,), 0),
        ((1,), 60),
        ((15,), 900),
        ((120,), 7200),
    ],
    2: [
        ((21, 20), True),
        ((20, 20), False),
        ((19, 20), False),
        ((0, -1), True),
        ((-5, -2), False),
    ],
    3: [
        (([18, 24, 20, 27], 20), 2),
        (([], 20), 0),
        (([25, 25], 20), 2),
        (([20, 20, 19], 20), 0),
        (([-3, 0, 4], -1), 2),
    ],
}


def run_checks(exercise: int) -> int:
    functions = {1: minutes_to_seconds, 2: is_over_limit, 3: count_over_limit}
    function = functions[exercise]
    failures = 0
    for arguments, expected in CASES[exercise]:
        before = tuple(arg.copy() if isinstance(arg, list) else arg for arg in arguments)
        try:
            actual = function(*arguments)
        except NotImplementedError:
            print(f"Exercise {exercise} is a starter: implement {function.__name__} first.")
            return 1
        except Exception as error:
            failures += 1
            print(f"FAIL {function.__name__}{before!r}: {type(error).__name__}: {error}")
            continue
        passed = type(actual) is type(expected) and actual == expected and arguments == before
        if passed:
            print(f"PASS {function.__name__}{before!r} -> {actual!r}")
        else:
            failures += 1
            print(f"FAIL {function.__name__}{before!r}: expected {expected!r}, got {actual!r}")
            if arguments != before:
                print("  The input list was changed. Keep it unchanged.")
    if failures:
        print(f"\n{failures} check(s) need attention. Revise and try again.")
        return 1
    print("\nAll provided checks passed. Add one of your own and explain your code.")
    return 0


if __name__ == "__main__":
    import sys

    if len(sys.argv) != 2 or sys.argv[1] not in {"1", "2", "3"}:
        print('Run: python3 "Interview Prep/01_python_basics.py" 1  (or 2 or 3)')
        raise SystemExit(2)
    raise SystemExit(run_checks(int(sys.argv[1])))
