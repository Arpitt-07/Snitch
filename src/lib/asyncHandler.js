// src/utils/asyncHandler.js
import { NextResponse } from "next/server";
import { ApiError } from "./ApiError";

export function asyncHandler(fn) {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json(
          {
            success: error.success,
            statusCode: error.statusCode,
            message: error.message,
            errors: error.errors,
            data: error.data,
          },
          { status: error.statusCode }
        );
      }

      console.error(error);
      return NextResponse.json(
        { success: false, statusCode: 500, message: "Internal Server Error", errors: [] },
        { status: 500 }
      );
    }
  };
}