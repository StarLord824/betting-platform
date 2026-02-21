import { describe, it, expect } from "vitest";
import { sortPanna, validateGameInput } from "./game-logic";

describe("Panna Sorting Logic", () => {
  it("Example A: Standard sorting (1, 4, 2) -> 124", () => {
    expect(sortPanna("142")).toBe("124");
  });

  it("Example B: Zero logic (5, 0, 2) -> 250", () => {
    // 2 is smallest, 5 is middle, 0 is largest (10)
    expect(sortPanna("502")).toBe("250");
  });

  it("Handles multiple zeros (0, 0, 5) -> 500", () => {
    expect(sortPanna("005")).toBe("500");
  });

  it("Handles all ascending correctly (1, 2, 3) -> 123", () => {
    expect(sortPanna("123")).toBe("123");
  });

  it("Handles all descending correctly (3, 2, 1) -> 123", () => {
    expect(sortPanna("321")).toBe("123");
  });

  it("Throws error for invalid length", () => {
    expect(() => sortPanna("12")).toThrow("Panna must be exactly 3 digits");
    expect(() => sortPanna("1234")).toThrow("Panna must be exactly 3 digits");
  });
});

describe("Game Input Validation", () => {
  it("Validates single digit", () => {
    expect(validateGameInput("single_digit", "5")).toBe(true);
    expect(validateGameInput("single_digit", "15")).toBe(false);
  });

  it("Validates jodi (2 digits)", () => {
    expect(validateGameInput("jodi", "55")).toBe(true);
    expect(validateGameInput("jodi", "5")).toBe(false);
    expect(validateGameInput("jodi", "155")).toBe(false);
  });

  it("Validates single panna (3 unique digits)", () => {
    expect(validateGameInput("single_panna", "123")).toBe(true);
    expect(validateGameInput("single_panna", "112")).toBe(false); // Not unique
    expect(validateGameInput("single_panna", "777")).toBe(false);
  });

  it("Validates double panna (exactly 1 pair)", () => {
    expect(validateGameInput("double_panna", "112")).toBe(true);
    expect(validateGameInput("double_panna", "282")).toBe(true);
    expect(validateGameInput("double_panna", "123")).toBe(false); // No pairs
    expect(validateGameInput("double_panna", "777")).toBe(false); // 3 of a kind
  });

  it("Validates triple panna (3 of a kind)", () => {
    expect(validateGameInput("triple_panna", "777")).toBe(true);
    expect(validateGameInput("triple_panna", "112")).toBe(false);
    expect(validateGameInput("triple_panna", "123")).toBe(false);
  });
});
