defmodule Calc do
  def main() do
    case IO.gets("input: ") do
      :eof ->
        IO.puts "All done"
      {:error, reason} ->
        IO.puts "Error: #{reason}"
      line ->
        eval(line)
        main()
    end
  end


  def eval(expression) do
    result = expression
    |> split_exp
    |> to_post_fix
    |> calculate

    if List.first(result) == :error or Enum.count(result) != 2 or Integer.parse(List.last(result)) == :error do
      IO.inspect "Failed to get the result, the expression might be illegal"
    else
      IO.inspect List.last(result)
    end
  end


  defp split_exp(expression) do
    expression
    |> String.replace("(", "( ")
    |> String.replace(")", " )")
    |> String.trim
    |> String.split(" ", trim: true)
  end


  defp to_post_fix(expression) do
    [stack, builder] = expression
    |> Enum.reduce([[], []], &to_post_fix/2)

    Enum.concat(builder, (stack |> Enum.reverse))
  end


  defp to_post_fix(c, [stack, builder]) do
    cond do
      is_add_or_minus(c) ->
        handle_add_minus_operator(c, [stack, builder])
      is_mul_or_div(c) ->
        handle_mul_div_operator(c, [stack, builder])
      c == "(" ->
        [List.insert_at(stack, -1, c), builder]
      c == ")" ->
        {left, right} = Enum.split_while(stack |> Enum.reverse, fn(i) -> i != "(" end)
        [List.delete_at(right, 0) |> Enum.reverse, builder ++ left]
      true ->
        [stack, builder ++ [c]]
    end
  end


  defp handle_add_minus_operator(c, [stack, builder]) do
    if List.first(stack) == nil or List.last(stack) == "(" do
      [stack ++ [c], builder]
    else
      {left, right} = Enum.split_while(stack |> Enum.reverse, fn(i) -> is_operator(i) end)
      [right |> Enum.reverse |> List.insert_at(-1, c), builder ++ left]
    end
  end


  defp handle_mul_div_operator(c, [stack, builder]) do
    if List.first(stack) == nil or (stack |> List.last |> is_add_or_minus) or List.last(stack) == "(" do
      [List.insert_at(stack, -1, c), builder]
    else
      {left, right} = Enum.split_while(stack |> Enum.reverse, fn(i) -> is_mul_or_div(i) end)
      [right |> Enum.reverse |> List.insert_at(-1, c), builder ++ left]
    end
  end


  defp calculate(post_fix_exp) do
    post_fix_exp
    |> Enum.reduce([:ok], &calculate/2)
  end


  defp calculate(c, operands) do
    if is_operator(c) do
      if Enum.count(operands) >= 3 do
        num2 = Integer.parse(List.last(operands)) |> elem(0)
        operands = List.delete_at(operands, -1)
        num1 = Integer.parse(List.last(operands)) |> elem(0)
        operands = List.delete_at(operands, -1)
        result = calculate(num1, num2, c)
        operands |> List.update_at(0, fn(_) -> List.first(result) end) |> List.insert_at(-1, List.last(result) |> Integer.to_string)
      end
    else
      List.insert_at(operands, -1, c)
    end
  end


  defp calculate(num1, num2, operator) do
    case operator do
      "+" -> [:ok, num1 + num2]
      "-" -> [:ok, num1 - num2]
      "*" -> [:ok, num1 * num2]
      "/" -> [:ok, div(num1, num2)]
      "_" -> [:error, -1]
    end
  end


  defp is_operator(c) do
    is_add_or_minus(c) or is_mul_or_div(c)
  end


  defp is_add_or_minus(c) do
    c === "+" or c === "-"
  end


  defp is_mul_or_div(c) do
    c === "*" or c === "/"
  end

end