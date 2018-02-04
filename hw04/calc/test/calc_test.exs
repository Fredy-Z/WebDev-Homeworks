defmodule CalcTest do
  use ExUnit.Case
  doctest Calc

  test "10" do
    assert Calc.eval("10") == "10"
  end

  test "2 + 3" do
    assert Calc.eval("2 + 3") == "5"
  end

  test "5 * 2" do
    assert Calc.eval("5 * 2") == "10"
  end

  test "24 / 6 + (5 - 4)" do
    assert Calc.eval("24 / 6 + (5 - 4)") == "5"
  end

  test "1 + 3 * 3 + 1" do
    assert Calc.eval("1 + 3 * 3 + 1") == "11"
  end

  test "1 + 3 * (3 + 1)" do
    assert Calc.eval("1 + 3 * (3 + 1)") == "13"
  end

  test "2 * (5 * (3 - 2) + 3 / 1 + (1 - 0))" do
    assert Calc.eval("2 * (5 * (3 - 2) + 3 / 1 + (1 - 0))") == "18"
  end

  test "4 * ((7 + 2) / 2 - 17 * (8 - 7) * 2) - 3 * 10" do
    assert Calc.eval("4 * ((7 + 2) / 2 - 17 * (8 - 7) * 2) - 3 * 5") == "-135"
  end
end
