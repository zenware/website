+++
date = "2020-02-19t20:20:41-06:00"
draft = true
title = "testing python code"

+++

The following is a selection of some Python testing libraries, commandline tools, etc. that I use, find cool, and have found real utility in when testing Python Code.

### unittest
The [unittest module](https://docs.python.org/3/library/unittest.html)
ships with python since 2.7 and includes some basic
[test discovery](https://docs.python.org/3/library/unittest.html#unittest-test-discovery).

```python
import unittest

class TestStringMethods(unittest.TestCase):

    def test_upper(self):
        self.assertEqual('foo'.upper(), 'FOO')

    def test_isupper(self):
        self.assertTrue('FOO'.isupper())
        self.assertFalse('Foo'.isupper())

if __name__ == '__main__':
    unittest.main()
```

### doctest
The [doctest module](https://docs.python.org/3/library/doctest.html)
also comes with python, but works in an entirely different way.
It reads docstrings and parses them for content that looks like an
interactive python session. It will try to execute the line that looks 
like someone typed it, and compare it to the line that looks like the 
expected result.

```python
def factorial(n):
    """Return the factorial of n, an exact integer >= 0.

    >>> [factorial(n) for n in range(6)]
    [1, 1, 2, 6, 24, 120]
    >>> factorial(30)
    265252859812191058636308480000000
    >>> factorial(-1)
    Traceback (most recent call last):
        ...
    ValueError: n must be >= 0

    Factorials of floats are OK, but the float must be an exact integer:
    >>> factorial(30.1)
    Traceback (most recent call last):
        ...
    ValueError: n must be exact integer
    >>> factorial(30.0)
    265252859812191058636308480000000

    It must also not be ridiculously large:
    >>> factorial(1e100)
    Traceback (most recent call last):
        ...
    OverflowError: n too large
    """

    import math
    if not n >= 0:
        raise ValueError("n must be >= 0")
    if math.floor(n) != n:
        raise ValueError("n must be exact integer")
    if n+1 == n:  # catch a value like 1e300
        raise OverflowError("n too large")
    result = 1
    factor = 2
    while factor <= n:
        result *= factor
        factor += 1
    return result


if __name__ == "__main__":
    import doctest
    doctest.testmod()
```

I think this is useful as expressive documentation of 
some use cases of a module or function, but not as a primary unit-testing 
strategy. Essentially this just confirms that the examples in your 
documentation do work, and proof of that can actually be really strong if
used well.

### py.test
[Pytest](https://docs.pytest.org/en/latest/) is the poster-child awesome
testing project that is just more convenient to use than unittest, and has many
plugins available to support any kind of scenario you could come up with. A
huge convenience comes in the form of how it actually renders the output in your console.

```python
# content of test_sample.py
def inc(x):
    return x + 1


def test_answer():
    assert inc(3) == 5
```

From this example you can see it's very simple to get started with pytest, even more simple than unittest.
Additionally, you can create some very complicated and expressive testing infrastructure with pytest.
In fact literally every other testing module mentioned here can be integrated with pytest in a convenient way.

### hypothesis
The [hypothesis](https://hypothesis.readthedocs.io/en/latest/) module is almost like a fuzzer-gone-testing-framework.
It helps to generate lots of different input meeting some defined constraints and essentially enables you to fuzz your
program with each test run. It only reports on failing inputs, and will almost certainly help you catch edge-cases you
wouldn't otherwise catch.

The following code will generate input that is considered a valid str in python.

```python
from hypothesis import given
from hypothesis.strategies import text

@given(text())
def test_decode_inverts_encode(s):
    assert decode(encode(s)) == s
```

I have friends who will argue that testing at least from frameworks should be idempotent or a functional map of a state of some code.
Mostly I think that's a cop-out and it seems silly. Hypothesis returns enough information for you to reproduce the errors that it created.
And it may create some errors that a human programmer isn't going to define on their own and overall I think it's a net benefit.

### tox
[Tox](https://tox.readthedocs.io/en/latest/) is a sort of automation tool I think originally created for CI pipelines which allows you to
test your python code against multiple versions of python with ease. It uses multiple actual versions of python and also
virtual environments to isolate dependencies for each instance of a test run. This can help make sure your code is compatible
with Python 2 and Python 3. However, Python 2 is deprecated officially January 1, 2020 so ideally projects will no longer
need this kind of compatibility testing, although I'm sure there will be at least a handful of projects that remain
supported in that way for a while.

That being the state of things, not everyone needs this, but I like using it anyway.

To choose which versions of python you want to test against, you create a file called tox.ini in the same dir as your
`setup.py` file.
```ini
[tox]
envlist = py27,py36

[testenv]
# install pytest in the virtualenv where commands will be executed
deps = pytest
commands =
    # NOTE: you can run any command line tool here - not just tests
    pytest
```

### Coverage.py
[Coverage.py](https://coverage.readthedocs.io/en/v4.5.x/) is a code coverage tool,
it measures code coverage with runtime analysis. It produces reports that look like this

```sh
$ coverage report -m
Name                      Stmts   Miss  Cover   Missing
-------------------------------------------------------
my_program.py                20      4    80%   33-35, 39
my_other_module.py           56      6    89%   17-23
-------------------------------------------------------
TOTAL                        76     10    87%

```

This can useful for making guarantees that your test suite is exercising enough of the code to give you a necessary level of confidence.
I know a lot of people chase code coverage by attempting to make a 1 to 1 mapping of tests and units, but I think
that just leads to low quality tests. One of the reasons I like `hypothesis`, and also the strategy, Behavior Driven Development
is that it makes more sense to test that a "larger" portion of your code is exhibiting the correct and consistent Behavior
than it is to ensure that each small piece of code has a test case related to it in some way.

### Radon
[Radon](https://radon.readthedocs.io/en/latest/) is a Comprehensive metrics suite giving you Cyclomatic Complexity,
Maintainability Index, and other things about your code that can be statistically analyzed.

The accuracy and utility of the formulae used to produce many of these metrics may be questionable but I still find it valuable
as a general guide to helping me produce clearer and more concise code.

By default the command line tool gives letter grades to your modules and functions/methods, which looks like this

```sh
$ radon cc sympy/solvers/solvers.py -a -nc
sympy/solvers/solvers.py
    F 346:0 solve - F
    F 1093:0 _solve - F
    F 1434:0 _solve_system - F
    F 2647:0 unrad - F
    F 110:0 checksol - F
    F 2238:0 _tsolve - F
    F 2482:0 _invert - F
    F 1862:0 solve_linear_system - E
    F 1781:0 minsolve_linear_system - D
    F 1636:0 solve_linear - D
    F 2382:0 nsolve - C

11 blocks (classes, functions, methods) analyzed.
Average complexity: F (61.0)
```

It can be coerced into giving you more information or qualitatively different kinds of information to better guide the
changes that would improve those scores. Usually a low score is due to something like a deeply nested loop or conditional.
