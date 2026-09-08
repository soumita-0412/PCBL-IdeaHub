// Categories are now persisted in MongoDB and fetched via the API.
// Types are re-exported from categoryService for backwards-compatible imports.
export type { CategoryResponse as Category, MatrixOption } from "@/services/categoryService";
