/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adaptive from "../adaptive.js";
import type * as ai from "../ai.js";
import type * as courses from "../courses.js";
import type * as exam from "../exam.js";
import type * as lessons from "../lessons.js";
import type * as seed from "../seed.js";
import type * as tutor from "../tutor.js";
import type * as userFix from "../userFix.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adaptive: typeof adaptive;
  ai: typeof ai;
  courses: typeof courses;
  exam: typeof exam;
  lessons: typeof lessons;
  seed: typeof seed;
  tutor: typeof tutor;
  userFix: typeof userFix;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
