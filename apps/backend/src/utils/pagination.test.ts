import { describe, expect, it } from "bun:test";
import { calculatePagination } from "./pagination.js";

describe("Pagination Logic", () => {
  it("should calculate offset correctly for page 1", () => {
    const { offset, limit } = calculatePagination({ page: 1, limit: 20 });
    expect(offset).toBe(0);
    expect(limit).toBe(20);
  });

  it("should calculate offset correctly for page 2", () => {
    const { offset } = calculatePagination({ page: 2, limit: 20 });
    expect(offset).toBe(20);
  });

  it("should handle invalid page numbers (0 or negative)", () => {
    const { offset } = calculatePagination({ page: 0, limit: 20 });
    expect(offset).toBe(0); // Should default to page 1
  });

  it("should calculate total pages correctly", () => {
    const { totalPages } = calculatePagination({ page: 1, limit: 20 });
    expect(totalPages(100)).toBe(5);
    expect(totalPages(21)).toBe(2);
    expect(totalPages(0)).toBe(0);
  });
});
