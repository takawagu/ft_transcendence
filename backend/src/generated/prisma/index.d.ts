
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model ItoGameRecord
 * 
 */
export type ItoGameRecord = $Result.DefaultSelection<Prisma.$ItoGameRecordPayload>
/**
 * Model Friendship
 * 
 */
export type Friendship = $Result.DefaultSelection<Prisma.$FriendshipPayload>
/**
 * Model Block
 * ブロック関係。方向あり（A→B と B→A は別の行）。
 * ブロックすると該当ペアのFriendshipは全削除されるため、両者が同時に存在することはない。
 */
export type Block = $Result.DefaultSelection<Prisma.$BlockPayload>
/**
 * Model DirectMessage
 * 
 */
export type DirectMessage = $Result.DefaultSelection<Prisma.$DirectMessagePayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.PrismaClientConstructorArgs<ClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.itoGameRecord`: Exposes CRUD operations for the **ItoGameRecord** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ItoGameRecords
    * const itoGameRecords = await prisma.itoGameRecord.findMany()
    * ```
    */
  get itoGameRecord(): Prisma.ItoGameRecordDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.friendship`: Exposes CRUD operations for the **Friendship** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Friendships
    * const friendships = await prisma.friendship.findMany()
    * ```
    */
  get friendship(): Prisma.FriendshipDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.block`: Exposes CRUD operations for the **Block** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Blocks
    * const blocks = await prisma.block.findMany()
    * ```
    */
  get block(): Prisma.BlockDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.directMessage`: Exposes CRUD operations for the **DirectMessage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DirectMessages
    * const directMessages = await prisma.directMessage.findMany()
    * ```
    */
  get directMessage(): Prisma.DirectMessageDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.9.0
   * Query Engine version: e922089b7d7502aff4249d5da3420f6fa55fc6ad
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * Resolved type of the argument passed to the `PrismaClient` constructor.
   *
   * When called without a narrower options type (the common case), this resolves
   * to `PrismaClientOptions` directly, which produces a clear TypeScript error
   * message (`not assignable to parameter of type 'PrismaClientOptions'`) when
   * the argument is missing or incomplete. When the user supplies a narrower
   * options type (e.g. via a literal), it falls back to `Subset` to keep
   * filtering out unknown properties.
   */
  export type PrismaClientConstructorArgs<Options extends PrismaClientOptions> =
    [PrismaClientOptions] extends [Options] ? PrismaClientOptions : Subset<Options, PrismaClientOptions>;

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      ((Without<T, U> & U) | (Without<U, T> & T)) & object
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    ItoGameRecord: 'ItoGameRecord',
    Friendship: 'Friendship',
    Block: 'Block',
    DirectMessage: 'DirectMessage'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "itoGameRecord" | "friendship" | "block" | "directMessage"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      ItoGameRecord: {
        payload: Prisma.$ItoGameRecordPayload<ExtArgs>
        fields: Prisma.ItoGameRecordFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ItoGameRecordFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItoGameRecordPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ItoGameRecordFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItoGameRecordPayload>
          }
          findFirst: {
            args: Prisma.ItoGameRecordFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItoGameRecordPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ItoGameRecordFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItoGameRecordPayload>
          }
          findMany: {
            args: Prisma.ItoGameRecordFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItoGameRecordPayload>[]
          }
          create: {
            args: Prisma.ItoGameRecordCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItoGameRecordPayload>
          }
          createMany: {
            args: Prisma.ItoGameRecordCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ItoGameRecordCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItoGameRecordPayload>[]
          }
          delete: {
            args: Prisma.ItoGameRecordDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItoGameRecordPayload>
          }
          update: {
            args: Prisma.ItoGameRecordUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItoGameRecordPayload>
          }
          deleteMany: {
            args: Prisma.ItoGameRecordDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ItoGameRecordUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ItoGameRecordUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItoGameRecordPayload>[]
          }
          upsert: {
            args: Prisma.ItoGameRecordUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItoGameRecordPayload>
          }
          aggregate: {
            args: Prisma.ItoGameRecordAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateItoGameRecord>
          }
          groupBy: {
            args: Prisma.ItoGameRecordGroupByArgs<ExtArgs>
            result: $Utils.Optional<ItoGameRecordGroupByOutputType>[]
          }
          count: {
            args: Prisma.ItoGameRecordCountArgs<ExtArgs>
            result: $Utils.Optional<ItoGameRecordCountAggregateOutputType> | number
          }
        }
      }
      Friendship: {
        payload: Prisma.$FriendshipPayload<ExtArgs>
        fields: Prisma.FriendshipFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FriendshipFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FriendshipPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FriendshipFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FriendshipPayload>
          }
          findFirst: {
            args: Prisma.FriendshipFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FriendshipPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FriendshipFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FriendshipPayload>
          }
          findMany: {
            args: Prisma.FriendshipFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FriendshipPayload>[]
          }
          create: {
            args: Prisma.FriendshipCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FriendshipPayload>
          }
          createMany: {
            args: Prisma.FriendshipCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FriendshipCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FriendshipPayload>[]
          }
          delete: {
            args: Prisma.FriendshipDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FriendshipPayload>
          }
          update: {
            args: Prisma.FriendshipUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FriendshipPayload>
          }
          deleteMany: {
            args: Prisma.FriendshipDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FriendshipUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FriendshipUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FriendshipPayload>[]
          }
          upsert: {
            args: Prisma.FriendshipUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FriendshipPayload>
          }
          aggregate: {
            args: Prisma.FriendshipAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFriendship>
          }
          groupBy: {
            args: Prisma.FriendshipGroupByArgs<ExtArgs>
            result: $Utils.Optional<FriendshipGroupByOutputType>[]
          }
          count: {
            args: Prisma.FriendshipCountArgs<ExtArgs>
            result: $Utils.Optional<FriendshipCountAggregateOutputType> | number
          }
        }
      }
      Block: {
        payload: Prisma.$BlockPayload<ExtArgs>
        fields: Prisma.BlockFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BlockFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlockPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BlockFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlockPayload>
          }
          findFirst: {
            args: Prisma.BlockFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlockPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BlockFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlockPayload>
          }
          findMany: {
            args: Prisma.BlockFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlockPayload>[]
          }
          create: {
            args: Prisma.BlockCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlockPayload>
          }
          createMany: {
            args: Prisma.BlockCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BlockCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlockPayload>[]
          }
          delete: {
            args: Prisma.BlockDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlockPayload>
          }
          update: {
            args: Prisma.BlockUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlockPayload>
          }
          deleteMany: {
            args: Prisma.BlockDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BlockUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BlockUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlockPayload>[]
          }
          upsert: {
            args: Prisma.BlockUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlockPayload>
          }
          aggregate: {
            args: Prisma.BlockAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBlock>
          }
          groupBy: {
            args: Prisma.BlockGroupByArgs<ExtArgs>
            result: $Utils.Optional<BlockGroupByOutputType>[]
          }
          count: {
            args: Prisma.BlockCountArgs<ExtArgs>
            result: $Utils.Optional<BlockCountAggregateOutputType> | number
          }
        }
      }
      DirectMessage: {
        payload: Prisma.$DirectMessagePayload<ExtArgs>
        fields: Prisma.DirectMessageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DirectMessageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DirectMessagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DirectMessageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DirectMessagePayload>
          }
          findFirst: {
            args: Prisma.DirectMessageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DirectMessagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DirectMessageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DirectMessagePayload>
          }
          findMany: {
            args: Prisma.DirectMessageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DirectMessagePayload>[]
          }
          create: {
            args: Prisma.DirectMessageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DirectMessagePayload>
          }
          createMany: {
            args: Prisma.DirectMessageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DirectMessageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DirectMessagePayload>[]
          }
          delete: {
            args: Prisma.DirectMessageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DirectMessagePayload>
          }
          update: {
            args: Prisma.DirectMessageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DirectMessagePayload>
          }
          deleteMany: {
            args: Prisma.DirectMessageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DirectMessageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DirectMessageUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DirectMessagePayload>[]
          }
          upsert: {
            args: Prisma.DirectMessageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DirectMessagePayload>
          }
          aggregate: {
            args: Prisma.DirectMessageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDirectMessage>
          }
          groupBy: {
            args: Prisma.DirectMessageGroupByArgs<ExtArgs>
            result: $Utils.Optional<DirectMessageGroupByOutputType>[]
          }
          count: {
            args: Prisma.DirectMessageCountArgs<ExtArgs>
            result: $Utils.Optional<DirectMessageCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * A driver adapter that PrismaClient uses to connect to your database, such as the ones provided by `@prisma/adapter-pg`, `@prisma/adapter-libsql`, `@prisma/adapter-planetscale`, etc.
     * 
     * A driver adapter is **required** unless you connect to your database through Prisma Accelerate (in which case use `accelerateUrl` instead).
     * 
     * Learn more: https://pris.ly/d/driver-adapters
     * 
     * @example
     * ```ts
     * import { PrismaPg } from '@prisma/adapter-pg'
     * import { PrismaClient } from './generated/prisma/client'
     * 
     * const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
     * const prisma = new PrismaClient({ adapter })
     * ```
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * The Prisma Accelerate connection URL. Use this option to connect to your database through Prisma Accelerate instead of using a driver adapter to connect directly.
     * 
     * Learn more: https://pris.ly/d/accelerate
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    itoGameRecord?: ItoGameRecordOmit
    friendship?: FriendshipOmit
    block?: BlockOmit
    directMessage?: DirectMessageOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    sentMessages: number
    receivedMessages: number
    appliedFriendships: number
    receivedFriendships: number
    blocksMade: number
    blocksReceived: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sentMessages?: boolean | UserCountOutputTypeCountSentMessagesArgs
    receivedMessages?: boolean | UserCountOutputTypeCountReceivedMessagesArgs
    appliedFriendships?: boolean | UserCountOutputTypeCountAppliedFriendshipsArgs
    receivedFriendships?: boolean | UserCountOutputTypeCountReceivedFriendshipsArgs
    blocksMade?: boolean | UserCountOutputTypeCountBlocksMadeArgs
    blocksReceived?: boolean | UserCountOutputTypeCountBlocksReceivedArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountSentMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DirectMessageWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountReceivedMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DirectMessageWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAppliedFriendshipsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FriendshipWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountReceivedFriendshipsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FriendshipWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountBlocksMadeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BlockWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountBlocksReceivedArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BlockWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    id: number | null
  }

  export type UserSumAggregateOutputType = {
    id: number | null
  }

  export type UserMinAggregateOutputType = {
    id: number | null
    email: string | null
    password: string | null
    username: string | null
    profileImage: string | null
    bio: string | null
  }

  export type UserMaxAggregateOutputType = {
    id: number | null
    email: string | null
    password: string | null
    username: string | null
    profileImage: string | null
    bio: string | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    password: number
    username: number
    profileImage: number
    bio: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    id?: true
  }

  export type UserSumAggregateInputType = {
    id?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    password?: true
    username?: true
    profileImage?: true
    bio?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    password?: true
    username?: true
    profileImage?: true
    bio?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    password?: true
    username?: true
    profileImage?: true
    bio?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: number
    email: string
    password: string
    username: string
    profileImage: string | null
    bio: string | null
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    username?: boolean
    profileImage?: boolean
    bio?: boolean
    gameRecord?: boolean | User$gameRecordArgs<ExtArgs>
    sentMessages?: boolean | User$sentMessagesArgs<ExtArgs>
    receivedMessages?: boolean | User$receivedMessagesArgs<ExtArgs>
    appliedFriendships?: boolean | User$appliedFriendshipsArgs<ExtArgs>
    receivedFriendships?: boolean | User$receivedFriendshipsArgs<ExtArgs>
    blocksMade?: boolean | User$blocksMadeArgs<ExtArgs>
    blocksReceived?: boolean | User$blocksReceivedArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    username?: boolean
    profileImage?: boolean
    bio?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    username?: boolean
    profileImage?: boolean
    bio?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    password?: boolean
    username?: boolean
    profileImage?: boolean
    bio?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "password" | "username" | "profileImage" | "bio", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    gameRecord?: boolean | User$gameRecordArgs<ExtArgs>
    sentMessages?: boolean | User$sentMessagesArgs<ExtArgs>
    receivedMessages?: boolean | User$receivedMessagesArgs<ExtArgs>
    appliedFriendships?: boolean | User$appliedFriendshipsArgs<ExtArgs>
    receivedFriendships?: boolean | User$receivedFriendshipsArgs<ExtArgs>
    blocksMade?: boolean | User$blocksMadeArgs<ExtArgs>
    blocksReceived?: boolean | User$blocksReceivedArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      gameRecord: Prisma.$ItoGameRecordPayload<ExtArgs> | null
      sentMessages: Prisma.$DirectMessagePayload<ExtArgs>[]
      receivedMessages: Prisma.$DirectMessagePayload<ExtArgs>[]
      appliedFriendships: Prisma.$FriendshipPayload<ExtArgs>[]
      receivedFriendships: Prisma.$FriendshipPayload<ExtArgs>[]
      blocksMade: Prisma.$BlockPayload<ExtArgs>[]
      blocksReceived: Prisma.$BlockPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      email: string
      password: string
      username: string
      profileImage: string | null
      bio: string | null
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    gameRecord<T extends User$gameRecordArgs<ExtArgs> = {}>(args?: Subset<T, User$gameRecordArgs<ExtArgs>>): Prisma__ItoGameRecordClient<$Result.GetResult<Prisma.$ItoGameRecordPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    sentMessages<T extends User$sentMessagesArgs<ExtArgs> = {}>(args?: Subset<T, User$sentMessagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DirectMessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    receivedMessages<T extends User$receivedMessagesArgs<ExtArgs> = {}>(args?: Subset<T, User$receivedMessagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DirectMessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    appliedFriendships<T extends User$appliedFriendshipsArgs<ExtArgs> = {}>(args?: Subset<T, User$appliedFriendshipsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FriendshipPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    receivedFriendships<T extends User$receivedFriendshipsArgs<ExtArgs> = {}>(args?: Subset<T, User$receivedFriendshipsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FriendshipPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    blocksMade<T extends User$blocksMadeArgs<ExtArgs> = {}>(args?: Subset<T, User$blocksMadeArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BlockPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    blocksReceived<T extends User$blocksReceivedArgs<ExtArgs> = {}>(args?: Subset<T, User$blocksReceivedArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BlockPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'Int'>
    readonly email: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly username: FieldRef<"User", 'String'>
    readonly profileImage: FieldRef<"User", 'String'>
    readonly bio: FieldRef<"User", 'String'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.gameRecord
   */
  export type User$gameRecordArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItoGameRecord
     */
    select?: ItoGameRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ItoGameRecord
     */
    omit?: ItoGameRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItoGameRecordInclude<ExtArgs> | null
    where?: ItoGameRecordWhereInput
  }

  /**
   * User.sentMessages
   */
  export type User$sentMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DirectMessage
     */
    select?: DirectMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DirectMessage
     */
    omit?: DirectMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DirectMessageInclude<ExtArgs> | null
    where?: DirectMessageWhereInput
    orderBy?: DirectMessageOrderByWithRelationInput | DirectMessageOrderByWithRelationInput[]
    cursor?: DirectMessageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DirectMessageScalarFieldEnum | DirectMessageScalarFieldEnum[]
  }

  /**
   * User.receivedMessages
   */
  export type User$receivedMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DirectMessage
     */
    select?: DirectMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DirectMessage
     */
    omit?: DirectMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DirectMessageInclude<ExtArgs> | null
    where?: DirectMessageWhereInput
    orderBy?: DirectMessageOrderByWithRelationInput | DirectMessageOrderByWithRelationInput[]
    cursor?: DirectMessageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DirectMessageScalarFieldEnum | DirectMessageScalarFieldEnum[]
  }

  /**
   * User.appliedFriendships
   */
  export type User$appliedFriendshipsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Friendship
     */
    select?: FriendshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Friendship
     */
    omit?: FriendshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FriendshipInclude<ExtArgs> | null
    where?: FriendshipWhereInput
    orderBy?: FriendshipOrderByWithRelationInput | FriendshipOrderByWithRelationInput[]
    cursor?: FriendshipWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FriendshipScalarFieldEnum | FriendshipScalarFieldEnum[]
  }

  /**
   * User.receivedFriendships
   */
  export type User$receivedFriendshipsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Friendship
     */
    select?: FriendshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Friendship
     */
    omit?: FriendshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FriendshipInclude<ExtArgs> | null
    where?: FriendshipWhereInput
    orderBy?: FriendshipOrderByWithRelationInput | FriendshipOrderByWithRelationInput[]
    cursor?: FriendshipWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FriendshipScalarFieldEnum | FriendshipScalarFieldEnum[]
  }

  /**
   * User.blocksMade
   */
  export type User$blocksMadeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Block
     */
    select?: BlockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Block
     */
    omit?: BlockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlockInclude<ExtArgs> | null
    where?: BlockWhereInput
    orderBy?: BlockOrderByWithRelationInput | BlockOrderByWithRelationInput[]
    cursor?: BlockWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BlockScalarFieldEnum | BlockScalarFieldEnum[]
  }

  /**
   * User.blocksReceived
   */
  export type User$blocksReceivedArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Block
     */
    select?: BlockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Block
     */
    omit?: BlockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlockInclude<ExtArgs> | null
    where?: BlockWhereInput
    orderBy?: BlockOrderByWithRelationInput | BlockOrderByWithRelationInput[]
    cursor?: BlockWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BlockScalarFieldEnum | BlockScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model ItoGameRecord
   */

  export type AggregateItoGameRecord = {
    _count: ItoGameRecordCountAggregateOutputType | null
    _avg: ItoGameRecordAvgAggregateOutputType | null
    _sum: ItoGameRecordSumAggregateOutputType | null
    _min: ItoGameRecordMinAggregateOutputType | null
    _max: ItoGameRecordMaxAggregateOutputType | null
  }

  export type ItoGameRecordAvgAggregateOutputType = {
    id: number | null
    userId: number | null
    totalGames: number | null
    successCount: number | null
  }

  export type ItoGameRecordSumAggregateOutputType = {
    id: number | null
    userId: number | null
    totalGames: number | null
    successCount: number | null
  }

  export type ItoGameRecordMinAggregateOutputType = {
    id: number | null
    userId: number | null
    totalGames: number | null
    successCount: number | null
  }

  export type ItoGameRecordMaxAggregateOutputType = {
    id: number | null
    userId: number | null
    totalGames: number | null
    successCount: number | null
  }

  export type ItoGameRecordCountAggregateOutputType = {
    id: number
    userId: number
    totalGames: number
    successCount: number
    _all: number
  }


  export type ItoGameRecordAvgAggregateInputType = {
    id?: true
    userId?: true
    totalGames?: true
    successCount?: true
  }

  export type ItoGameRecordSumAggregateInputType = {
    id?: true
    userId?: true
    totalGames?: true
    successCount?: true
  }

  export type ItoGameRecordMinAggregateInputType = {
    id?: true
    userId?: true
    totalGames?: true
    successCount?: true
  }

  export type ItoGameRecordMaxAggregateInputType = {
    id?: true
    userId?: true
    totalGames?: true
    successCount?: true
  }

  export type ItoGameRecordCountAggregateInputType = {
    id?: true
    userId?: true
    totalGames?: true
    successCount?: true
    _all?: true
  }

  export type ItoGameRecordAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ItoGameRecord to aggregate.
     */
    where?: ItoGameRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ItoGameRecords to fetch.
     */
    orderBy?: ItoGameRecordOrderByWithRelationInput | ItoGameRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ItoGameRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ItoGameRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ItoGameRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ItoGameRecords
    **/
    _count?: true | ItoGameRecordCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ItoGameRecordAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ItoGameRecordSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ItoGameRecordMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ItoGameRecordMaxAggregateInputType
  }

  export type GetItoGameRecordAggregateType<T extends ItoGameRecordAggregateArgs> = {
        [P in keyof T & keyof AggregateItoGameRecord]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateItoGameRecord[P]>
      : GetScalarType<T[P], AggregateItoGameRecord[P]>
  }




  export type ItoGameRecordGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ItoGameRecordWhereInput
    orderBy?: ItoGameRecordOrderByWithAggregationInput | ItoGameRecordOrderByWithAggregationInput[]
    by: ItoGameRecordScalarFieldEnum[] | ItoGameRecordScalarFieldEnum
    having?: ItoGameRecordScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ItoGameRecordCountAggregateInputType | true
    _avg?: ItoGameRecordAvgAggregateInputType
    _sum?: ItoGameRecordSumAggregateInputType
    _min?: ItoGameRecordMinAggregateInputType
    _max?: ItoGameRecordMaxAggregateInputType
  }

  export type ItoGameRecordGroupByOutputType = {
    id: number
    userId: number
    totalGames: number
    successCount: number
    _count: ItoGameRecordCountAggregateOutputType | null
    _avg: ItoGameRecordAvgAggregateOutputType | null
    _sum: ItoGameRecordSumAggregateOutputType | null
    _min: ItoGameRecordMinAggregateOutputType | null
    _max: ItoGameRecordMaxAggregateOutputType | null
  }

  type GetItoGameRecordGroupByPayload<T extends ItoGameRecordGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ItoGameRecordGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ItoGameRecordGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ItoGameRecordGroupByOutputType[P]>
            : GetScalarType<T[P], ItoGameRecordGroupByOutputType[P]>
        }
      >
    >


  export type ItoGameRecordSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    totalGames?: boolean
    successCount?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["itoGameRecord"]>

  export type ItoGameRecordSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    totalGames?: boolean
    successCount?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["itoGameRecord"]>

  export type ItoGameRecordSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    totalGames?: boolean
    successCount?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["itoGameRecord"]>

  export type ItoGameRecordSelectScalar = {
    id?: boolean
    userId?: boolean
    totalGames?: boolean
    successCount?: boolean
  }

  export type ItoGameRecordOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "totalGames" | "successCount", ExtArgs["result"]["itoGameRecord"]>
  export type ItoGameRecordInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ItoGameRecordIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ItoGameRecordIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $ItoGameRecordPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ItoGameRecord"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      userId: number
      totalGames: number
      successCount: number
    }, ExtArgs["result"]["itoGameRecord"]>
    composites: {}
  }

  type ItoGameRecordGetPayload<S extends boolean | null | undefined | ItoGameRecordDefaultArgs> = $Result.GetResult<Prisma.$ItoGameRecordPayload, S>

  type ItoGameRecordCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ItoGameRecordFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ItoGameRecordCountAggregateInputType | true
    }

  export interface ItoGameRecordDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ItoGameRecord'], meta: { name: 'ItoGameRecord' } }
    /**
     * Find zero or one ItoGameRecord that matches the filter.
     * @param {ItoGameRecordFindUniqueArgs} args - Arguments to find a ItoGameRecord
     * @example
     * // Get one ItoGameRecord
     * const itoGameRecord = await prisma.itoGameRecord.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ItoGameRecordFindUniqueArgs>(args: SelectSubset<T, ItoGameRecordFindUniqueArgs<ExtArgs>>): Prisma__ItoGameRecordClient<$Result.GetResult<Prisma.$ItoGameRecordPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ItoGameRecord that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ItoGameRecordFindUniqueOrThrowArgs} args - Arguments to find a ItoGameRecord
     * @example
     * // Get one ItoGameRecord
     * const itoGameRecord = await prisma.itoGameRecord.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ItoGameRecordFindUniqueOrThrowArgs>(args: SelectSubset<T, ItoGameRecordFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ItoGameRecordClient<$Result.GetResult<Prisma.$ItoGameRecordPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ItoGameRecord that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItoGameRecordFindFirstArgs} args - Arguments to find a ItoGameRecord
     * @example
     * // Get one ItoGameRecord
     * const itoGameRecord = await prisma.itoGameRecord.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ItoGameRecordFindFirstArgs>(args?: SelectSubset<T, ItoGameRecordFindFirstArgs<ExtArgs>>): Prisma__ItoGameRecordClient<$Result.GetResult<Prisma.$ItoGameRecordPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ItoGameRecord that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItoGameRecordFindFirstOrThrowArgs} args - Arguments to find a ItoGameRecord
     * @example
     * // Get one ItoGameRecord
     * const itoGameRecord = await prisma.itoGameRecord.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ItoGameRecordFindFirstOrThrowArgs>(args?: SelectSubset<T, ItoGameRecordFindFirstOrThrowArgs<ExtArgs>>): Prisma__ItoGameRecordClient<$Result.GetResult<Prisma.$ItoGameRecordPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ItoGameRecords that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItoGameRecordFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ItoGameRecords
     * const itoGameRecords = await prisma.itoGameRecord.findMany()
     * 
     * // Get first 10 ItoGameRecords
     * const itoGameRecords = await prisma.itoGameRecord.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const itoGameRecordWithIdOnly = await prisma.itoGameRecord.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ItoGameRecordFindManyArgs>(args?: SelectSubset<T, ItoGameRecordFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ItoGameRecordPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ItoGameRecord.
     * @param {ItoGameRecordCreateArgs} args - Arguments to create a ItoGameRecord.
     * @example
     * // Create one ItoGameRecord
     * const ItoGameRecord = await prisma.itoGameRecord.create({
     *   data: {
     *     // ... data to create a ItoGameRecord
     *   }
     * })
     * 
     */
    create<T extends ItoGameRecordCreateArgs>(args: SelectSubset<T, ItoGameRecordCreateArgs<ExtArgs>>): Prisma__ItoGameRecordClient<$Result.GetResult<Prisma.$ItoGameRecordPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ItoGameRecords.
     * @param {ItoGameRecordCreateManyArgs} args - Arguments to create many ItoGameRecords.
     * @example
     * // Create many ItoGameRecords
     * const itoGameRecord = await prisma.itoGameRecord.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ItoGameRecordCreateManyArgs>(args?: SelectSubset<T, ItoGameRecordCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ItoGameRecords and returns the data saved in the database.
     * @param {ItoGameRecordCreateManyAndReturnArgs} args - Arguments to create many ItoGameRecords.
     * @example
     * // Create many ItoGameRecords
     * const itoGameRecord = await prisma.itoGameRecord.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ItoGameRecords and only return the `id`
     * const itoGameRecordWithIdOnly = await prisma.itoGameRecord.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ItoGameRecordCreateManyAndReturnArgs>(args?: SelectSubset<T, ItoGameRecordCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ItoGameRecordPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ItoGameRecord.
     * @param {ItoGameRecordDeleteArgs} args - Arguments to delete one ItoGameRecord.
     * @example
     * // Delete one ItoGameRecord
     * const ItoGameRecord = await prisma.itoGameRecord.delete({
     *   where: {
     *     // ... filter to delete one ItoGameRecord
     *   }
     * })
     * 
     */
    delete<T extends ItoGameRecordDeleteArgs>(args: SelectSubset<T, ItoGameRecordDeleteArgs<ExtArgs>>): Prisma__ItoGameRecordClient<$Result.GetResult<Prisma.$ItoGameRecordPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ItoGameRecord.
     * @param {ItoGameRecordUpdateArgs} args - Arguments to update one ItoGameRecord.
     * @example
     * // Update one ItoGameRecord
     * const itoGameRecord = await prisma.itoGameRecord.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ItoGameRecordUpdateArgs>(args: SelectSubset<T, ItoGameRecordUpdateArgs<ExtArgs>>): Prisma__ItoGameRecordClient<$Result.GetResult<Prisma.$ItoGameRecordPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ItoGameRecords.
     * @param {ItoGameRecordDeleteManyArgs} args - Arguments to filter ItoGameRecords to delete.
     * @example
     * // Delete a few ItoGameRecords
     * const { count } = await prisma.itoGameRecord.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ItoGameRecordDeleteManyArgs>(args?: SelectSubset<T, ItoGameRecordDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ItoGameRecords.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItoGameRecordUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ItoGameRecords
     * const itoGameRecord = await prisma.itoGameRecord.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ItoGameRecordUpdateManyArgs>(args: SelectSubset<T, ItoGameRecordUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ItoGameRecords and returns the data updated in the database.
     * @param {ItoGameRecordUpdateManyAndReturnArgs} args - Arguments to update many ItoGameRecords.
     * @example
     * // Update many ItoGameRecords
     * const itoGameRecord = await prisma.itoGameRecord.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ItoGameRecords and only return the `id`
     * const itoGameRecordWithIdOnly = await prisma.itoGameRecord.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ItoGameRecordUpdateManyAndReturnArgs>(args: SelectSubset<T, ItoGameRecordUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ItoGameRecordPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ItoGameRecord.
     * @param {ItoGameRecordUpsertArgs} args - Arguments to update or create a ItoGameRecord.
     * @example
     * // Update or create a ItoGameRecord
     * const itoGameRecord = await prisma.itoGameRecord.upsert({
     *   create: {
     *     // ... data to create a ItoGameRecord
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ItoGameRecord we want to update
     *   }
     * })
     */
    upsert<T extends ItoGameRecordUpsertArgs>(args: SelectSubset<T, ItoGameRecordUpsertArgs<ExtArgs>>): Prisma__ItoGameRecordClient<$Result.GetResult<Prisma.$ItoGameRecordPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ItoGameRecords.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItoGameRecordCountArgs} args - Arguments to filter ItoGameRecords to count.
     * @example
     * // Count the number of ItoGameRecords
     * const count = await prisma.itoGameRecord.count({
     *   where: {
     *     // ... the filter for the ItoGameRecords we want to count
     *   }
     * })
    **/
    count<T extends ItoGameRecordCountArgs>(
      args?: Subset<T, ItoGameRecordCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ItoGameRecordCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ItoGameRecord.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItoGameRecordAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ItoGameRecordAggregateArgs>(args: Subset<T, ItoGameRecordAggregateArgs>): Prisma.PrismaPromise<GetItoGameRecordAggregateType<T>>

    /**
     * Group by ItoGameRecord.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItoGameRecordGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ItoGameRecordGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ItoGameRecordGroupByArgs['orderBy'] }
        : { orderBy?: ItoGameRecordGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ItoGameRecordGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetItoGameRecordGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ItoGameRecord model
   */
  readonly fields: ItoGameRecordFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ItoGameRecord.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ItoGameRecordClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ItoGameRecord model
   */
  interface ItoGameRecordFieldRefs {
    readonly id: FieldRef<"ItoGameRecord", 'Int'>
    readonly userId: FieldRef<"ItoGameRecord", 'Int'>
    readonly totalGames: FieldRef<"ItoGameRecord", 'Int'>
    readonly successCount: FieldRef<"ItoGameRecord", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * ItoGameRecord findUnique
   */
  export type ItoGameRecordFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItoGameRecord
     */
    select?: ItoGameRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ItoGameRecord
     */
    omit?: ItoGameRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItoGameRecordInclude<ExtArgs> | null
    /**
     * Filter, which ItoGameRecord to fetch.
     */
    where: ItoGameRecordWhereUniqueInput
  }

  /**
   * ItoGameRecord findUniqueOrThrow
   */
  export type ItoGameRecordFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItoGameRecord
     */
    select?: ItoGameRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ItoGameRecord
     */
    omit?: ItoGameRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItoGameRecordInclude<ExtArgs> | null
    /**
     * Filter, which ItoGameRecord to fetch.
     */
    where: ItoGameRecordWhereUniqueInput
  }

  /**
   * ItoGameRecord findFirst
   */
  export type ItoGameRecordFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItoGameRecord
     */
    select?: ItoGameRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ItoGameRecord
     */
    omit?: ItoGameRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItoGameRecordInclude<ExtArgs> | null
    /**
     * Filter, which ItoGameRecord to fetch.
     */
    where?: ItoGameRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ItoGameRecords to fetch.
     */
    orderBy?: ItoGameRecordOrderByWithRelationInput | ItoGameRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ItoGameRecords.
     */
    cursor?: ItoGameRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ItoGameRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ItoGameRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ItoGameRecords.
     */
    distinct?: ItoGameRecordScalarFieldEnum | ItoGameRecordScalarFieldEnum[]
  }

  /**
   * ItoGameRecord findFirstOrThrow
   */
  export type ItoGameRecordFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItoGameRecord
     */
    select?: ItoGameRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ItoGameRecord
     */
    omit?: ItoGameRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItoGameRecordInclude<ExtArgs> | null
    /**
     * Filter, which ItoGameRecord to fetch.
     */
    where?: ItoGameRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ItoGameRecords to fetch.
     */
    orderBy?: ItoGameRecordOrderByWithRelationInput | ItoGameRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ItoGameRecords.
     */
    cursor?: ItoGameRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ItoGameRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ItoGameRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ItoGameRecords.
     */
    distinct?: ItoGameRecordScalarFieldEnum | ItoGameRecordScalarFieldEnum[]
  }

  /**
   * ItoGameRecord findMany
   */
  export type ItoGameRecordFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItoGameRecord
     */
    select?: ItoGameRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ItoGameRecord
     */
    omit?: ItoGameRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItoGameRecordInclude<ExtArgs> | null
    /**
     * Filter, which ItoGameRecords to fetch.
     */
    where?: ItoGameRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ItoGameRecords to fetch.
     */
    orderBy?: ItoGameRecordOrderByWithRelationInput | ItoGameRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ItoGameRecords.
     */
    cursor?: ItoGameRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ItoGameRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ItoGameRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ItoGameRecords.
     */
    distinct?: ItoGameRecordScalarFieldEnum | ItoGameRecordScalarFieldEnum[]
  }

  /**
   * ItoGameRecord create
   */
  export type ItoGameRecordCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItoGameRecord
     */
    select?: ItoGameRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ItoGameRecord
     */
    omit?: ItoGameRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItoGameRecordInclude<ExtArgs> | null
    /**
     * The data needed to create a ItoGameRecord.
     */
    data: XOR<ItoGameRecordCreateInput, ItoGameRecordUncheckedCreateInput>
  }

  /**
   * ItoGameRecord createMany
   */
  export type ItoGameRecordCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ItoGameRecords.
     */
    data: ItoGameRecordCreateManyInput | ItoGameRecordCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ItoGameRecord createManyAndReturn
   */
  export type ItoGameRecordCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItoGameRecord
     */
    select?: ItoGameRecordSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ItoGameRecord
     */
    omit?: ItoGameRecordOmit<ExtArgs> | null
    /**
     * The data used to create many ItoGameRecords.
     */
    data: ItoGameRecordCreateManyInput | ItoGameRecordCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItoGameRecordIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ItoGameRecord update
   */
  export type ItoGameRecordUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItoGameRecord
     */
    select?: ItoGameRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ItoGameRecord
     */
    omit?: ItoGameRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItoGameRecordInclude<ExtArgs> | null
    /**
     * The data needed to update a ItoGameRecord.
     */
    data: XOR<ItoGameRecordUpdateInput, ItoGameRecordUncheckedUpdateInput>
    /**
     * Choose, which ItoGameRecord to update.
     */
    where: ItoGameRecordWhereUniqueInput
  }

  /**
   * ItoGameRecord updateMany
   */
  export type ItoGameRecordUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ItoGameRecords.
     */
    data: XOR<ItoGameRecordUpdateManyMutationInput, ItoGameRecordUncheckedUpdateManyInput>
    /**
     * Filter which ItoGameRecords to update
     */
    where?: ItoGameRecordWhereInput
    /**
     * Limit how many ItoGameRecords to update.
     */
    limit?: number
  }

  /**
   * ItoGameRecord updateManyAndReturn
   */
  export type ItoGameRecordUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItoGameRecord
     */
    select?: ItoGameRecordSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ItoGameRecord
     */
    omit?: ItoGameRecordOmit<ExtArgs> | null
    /**
     * The data used to update ItoGameRecords.
     */
    data: XOR<ItoGameRecordUpdateManyMutationInput, ItoGameRecordUncheckedUpdateManyInput>
    /**
     * Filter which ItoGameRecords to update
     */
    where?: ItoGameRecordWhereInput
    /**
     * Limit how many ItoGameRecords to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItoGameRecordIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ItoGameRecord upsert
   */
  export type ItoGameRecordUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItoGameRecord
     */
    select?: ItoGameRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ItoGameRecord
     */
    omit?: ItoGameRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItoGameRecordInclude<ExtArgs> | null
    /**
     * The filter to search for the ItoGameRecord to update in case it exists.
     */
    where: ItoGameRecordWhereUniqueInput
    /**
     * In case the ItoGameRecord found by the `where` argument doesn't exist, create a new ItoGameRecord with this data.
     */
    create: XOR<ItoGameRecordCreateInput, ItoGameRecordUncheckedCreateInput>
    /**
     * In case the ItoGameRecord was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ItoGameRecordUpdateInput, ItoGameRecordUncheckedUpdateInput>
  }

  /**
   * ItoGameRecord delete
   */
  export type ItoGameRecordDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItoGameRecord
     */
    select?: ItoGameRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ItoGameRecord
     */
    omit?: ItoGameRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItoGameRecordInclude<ExtArgs> | null
    /**
     * Filter which ItoGameRecord to delete.
     */
    where: ItoGameRecordWhereUniqueInput
  }

  /**
   * ItoGameRecord deleteMany
   */
  export type ItoGameRecordDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ItoGameRecords to delete
     */
    where?: ItoGameRecordWhereInput
    /**
     * Limit how many ItoGameRecords to delete.
     */
    limit?: number
  }

  /**
   * ItoGameRecord without action
   */
  export type ItoGameRecordDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItoGameRecord
     */
    select?: ItoGameRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ItoGameRecord
     */
    omit?: ItoGameRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItoGameRecordInclude<ExtArgs> | null
  }


  /**
   * Model Friendship
   */

  export type AggregateFriendship = {
    _count: FriendshipCountAggregateOutputType | null
    _avg: FriendshipAvgAggregateOutputType | null
    _sum: FriendshipSumAggregateOutputType | null
    _min: FriendshipMinAggregateOutputType | null
    _max: FriendshipMaxAggregateOutputType | null
  }

  export type FriendshipAvgAggregateOutputType = {
    id: number | null
    applicantId: number | null
    approverId: number | null
  }

  export type FriendshipSumAggregateOutputType = {
    id: number | null
    applicantId: number | null
    approverId: number | null
  }

  export type FriendshipMinAggregateOutputType = {
    id: number | null
    applicantId: number | null
    approverId: number | null
    status: string | null
    createdAt: Date | null
  }

  export type FriendshipMaxAggregateOutputType = {
    id: number | null
    applicantId: number | null
    approverId: number | null
    status: string | null
    createdAt: Date | null
  }

  export type FriendshipCountAggregateOutputType = {
    id: number
    applicantId: number
    approverId: number
    status: number
    createdAt: number
    _all: number
  }


  export type FriendshipAvgAggregateInputType = {
    id?: true
    applicantId?: true
    approverId?: true
  }

  export type FriendshipSumAggregateInputType = {
    id?: true
    applicantId?: true
    approverId?: true
  }

  export type FriendshipMinAggregateInputType = {
    id?: true
    applicantId?: true
    approverId?: true
    status?: true
    createdAt?: true
  }

  export type FriendshipMaxAggregateInputType = {
    id?: true
    applicantId?: true
    approverId?: true
    status?: true
    createdAt?: true
  }

  export type FriendshipCountAggregateInputType = {
    id?: true
    applicantId?: true
    approverId?: true
    status?: true
    createdAt?: true
    _all?: true
  }

  export type FriendshipAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Friendship to aggregate.
     */
    where?: FriendshipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Friendships to fetch.
     */
    orderBy?: FriendshipOrderByWithRelationInput | FriendshipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FriendshipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Friendships from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Friendships.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Friendships
    **/
    _count?: true | FriendshipCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FriendshipAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FriendshipSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FriendshipMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FriendshipMaxAggregateInputType
  }

  export type GetFriendshipAggregateType<T extends FriendshipAggregateArgs> = {
        [P in keyof T & keyof AggregateFriendship]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFriendship[P]>
      : GetScalarType<T[P], AggregateFriendship[P]>
  }




  export type FriendshipGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FriendshipWhereInput
    orderBy?: FriendshipOrderByWithAggregationInput | FriendshipOrderByWithAggregationInput[]
    by: FriendshipScalarFieldEnum[] | FriendshipScalarFieldEnum
    having?: FriendshipScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FriendshipCountAggregateInputType | true
    _avg?: FriendshipAvgAggregateInputType
    _sum?: FriendshipSumAggregateInputType
    _min?: FriendshipMinAggregateInputType
    _max?: FriendshipMaxAggregateInputType
  }

  export type FriendshipGroupByOutputType = {
    id: number
    applicantId: number
    approverId: number
    status: string
    createdAt: Date
    _count: FriendshipCountAggregateOutputType | null
    _avg: FriendshipAvgAggregateOutputType | null
    _sum: FriendshipSumAggregateOutputType | null
    _min: FriendshipMinAggregateOutputType | null
    _max: FriendshipMaxAggregateOutputType | null
  }

  type GetFriendshipGroupByPayload<T extends FriendshipGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FriendshipGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FriendshipGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FriendshipGroupByOutputType[P]>
            : GetScalarType<T[P], FriendshipGroupByOutputType[P]>
        }
      >
    >


  export type FriendshipSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    applicantId?: boolean
    approverId?: boolean
    status?: boolean
    createdAt?: boolean
    applicant?: boolean | UserDefaultArgs<ExtArgs>
    approver?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["friendship"]>

  export type FriendshipSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    applicantId?: boolean
    approverId?: boolean
    status?: boolean
    createdAt?: boolean
    applicant?: boolean | UserDefaultArgs<ExtArgs>
    approver?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["friendship"]>

  export type FriendshipSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    applicantId?: boolean
    approverId?: boolean
    status?: boolean
    createdAt?: boolean
    applicant?: boolean | UserDefaultArgs<ExtArgs>
    approver?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["friendship"]>

  export type FriendshipSelectScalar = {
    id?: boolean
    applicantId?: boolean
    approverId?: boolean
    status?: boolean
    createdAt?: boolean
  }

  export type FriendshipOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "applicantId" | "approverId" | "status" | "createdAt", ExtArgs["result"]["friendship"]>
  export type FriendshipInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    applicant?: boolean | UserDefaultArgs<ExtArgs>
    approver?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type FriendshipIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    applicant?: boolean | UserDefaultArgs<ExtArgs>
    approver?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type FriendshipIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    applicant?: boolean | UserDefaultArgs<ExtArgs>
    approver?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $FriendshipPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Friendship"
    objects: {
      applicant: Prisma.$UserPayload<ExtArgs>
      approver: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      applicantId: number
      approverId: number
      status: string
      createdAt: Date
    }, ExtArgs["result"]["friendship"]>
    composites: {}
  }

  type FriendshipGetPayload<S extends boolean | null | undefined | FriendshipDefaultArgs> = $Result.GetResult<Prisma.$FriendshipPayload, S>

  type FriendshipCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FriendshipFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FriendshipCountAggregateInputType | true
    }

  export interface FriendshipDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Friendship'], meta: { name: 'Friendship' } }
    /**
     * Find zero or one Friendship that matches the filter.
     * @param {FriendshipFindUniqueArgs} args - Arguments to find a Friendship
     * @example
     * // Get one Friendship
     * const friendship = await prisma.friendship.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FriendshipFindUniqueArgs>(args: SelectSubset<T, FriendshipFindUniqueArgs<ExtArgs>>): Prisma__FriendshipClient<$Result.GetResult<Prisma.$FriendshipPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Friendship that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FriendshipFindUniqueOrThrowArgs} args - Arguments to find a Friendship
     * @example
     * // Get one Friendship
     * const friendship = await prisma.friendship.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FriendshipFindUniqueOrThrowArgs>(args: SelectSubset<T, FriendshipFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FriendshipClient<$Result.GetResult<Prisma.$FriendshipPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Friendship that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FriendshipFindFirstArgs} args - Arguments to find a Friendship
     * @example
     * // Get one Friendship
     * const friendship = await prisma.friendship.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FriendshipFindFirstArgs>(args?: SelectSubset<T, FriendshipFindFirstArgs<ExtArgs>>): Prisma__FriendshipClient<$Result.GetResult<Prisma.$FriendshipPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Friendship that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FriendshipFindFirstOrThrowArgs} args - Arguments to find a Friendship
     * @example
     * // Get one Friendship
     * const friendship = await prisma.friendship.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FriendshipFindFirstOrThrowArgs>(args?: SelectSubset<T, FriendshipFindFirstOrThrowArgs<ExtArgs>>): Prisma__FriendshipClient<$Result.GetResult<Prisma.$FriendshipPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Friendships that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FriendshipFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Friendships
     * const friendships = await prisma.friendship.findMany()
     * 
     * // Get first 10 Friendships
     * const friendships = await prisma.friendship.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const friendshipWithIdOnly = await prisma.friendship.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FriendshipFindManyArgs>(args?: SelectSubset<T, FriendshipFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FriendshipPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Friendship.
     * @param {FriendshipCreateArgs} args - Arguments to create a Friendship.
     * @example
     * // Create one Friendship
     * const Friendship = await prisma.friendship.create({
     *   data: {
     *     // ... data to create a Friendship
     *   }
     * })
     * 
     */
    create<T extends FriendshipCreateArgs>(args: SelectSubset<T, FriendshipCreateArgs<ExtArgs>>): Prisma__FriendshipClient<$Result.GetResult<Prisma.$FriendshipPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Friendships.
     * @param {FriendshipCreateManyArgs} args - Arguments to create many Friendships.
     * @example
     * // Create many Friendships
     * const friendship = await prisma.friendship.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FriendshipCreateManyArgs>(args?: SelectSubset<T, FriendshipCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Friendships and returns the data saved in the database.
     * @param {FriendshipCreateManyAndReturnArgs} args - Arguments to create many Friendships.
     * @example
     * // Create many Friendships
     * const friendship = await prisma.friendship.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Friendships and only return the `id`
     * const friendshipWithIdOnly = await prisma.friendship.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FriendshipCreateManyAndReturnArgs>(args?: SelectSubset<T, FriendshipCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FriendshipPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Friendship.
     * @param {FriendshipDeleteArgs} args - Arguments to delete one Friendship.
     * @example
     * // Delete one Friendship
     * const Friendship = await prisma.friendship.delete({
     *   where: {
     *     // ... filter to delete one Friendship
     *   }
     * })
     * 
     */
    delete<T extends FriendshipDeleteArgs>(args: SelectSubset<T, FriendshipDeleteArgs<ExtArgs>>): Prisma__FriendshipClient<$Result.GetResult<Prisma.$FriendshipPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Friendship.
     * @param {FriendshipUpdateArgs} args - Arguments to update one Friendship.
     * @example
     * // Update one Friendship
     * const friendship = await prisma.friendship.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FriendshipUpdateArgs>(args: SelectSubset<T, FriendshipUpdateArgs<ExtArgs>>): Prisma__FriendshipClient<$Result.GetResult<Prisma.$FriendshipPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Friendships.
     * @param {FriendshipDeleteManyArgs} args - Arguments to filter Friendships to delete.
     * @example
     * // Delete a few Friendships
     * const { count } = await prisma.friendship.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FriendshipDeleteManyArgs>(args?: SelectSubset<T, FriendshipDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Friendships.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FriendshipUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Friendships
     * const friendship = await prisma.friendship.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FriendshipUpdateManyArgs>(args: SelectSubset<T, FriendshipUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Friendships and returns the data updated in the database.
     * @param {FriendshipUpdateManyAndReturnArgs} args - Arguments to update many Friendships.
     * @example
     * // Update many Friendships
     * const friendship = await prisma.friendship.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Friendships and only return the `id`
     * const friendshipWithIdOnly = await prisma.friendship.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends FriendshipUpdateManyAndReturnArgs>(args: SelectSubset<T, FriendshipUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FriendshipPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Friendship.
     * @param {FriendshipUpsertArgs} args - Arguments to update or create a Friendship.
     * @example
     * // Update or create a Friendship
     * const friendship = await prisma.friendship.upsert({
     *   create: {
     *     // ... data to create a Friendship
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Friendship we want to update
     *   }
     * })
     */
    upsert<T extends FriendshipUpsertArgs>(args: SelectSubset<T, FriendshipUpsertArgs<ExtArgs>>): Prisma__FriendshipClient<$Result.GetResult<Prisma.$FriendshipPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Friendships.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FriendshipCountArgs} args - Arguments to filter Friendships to count.
     * @example
     * // Count the number of Friendships
     * const count = await prisma.friendship.count({
     *   where: {
     *     // ... the filter for the Friendships we want to count
     *   }
     * })
    **/
    count<T extends FriendshipCountArgs>(
      args?: Subset<T, FriendshipCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FriendshipCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Friendship.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FriendshipAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FriendshipAggregateArgs>(args: Subset<T, FriendshipAggregateArgs>): Prisma.PrismaPromise<GetFriendshipAggregateType<T>>

    /**
     * Group by Friendship.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FriendshipGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FriendshipGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FriendshipGroupByArgs['orderBy'] }
        : { orderBy?: FriendshipGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FriendshipGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFriendshipGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Friendship model
   */
  readonly fields: FriendshipFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Friendship.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FriendshipClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    applicant<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    approver<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Friendship model
   */
  interface FriendshipFieldRefs {
    readonly id: FieldRef<"Friendship", 'Int'>
    readonly applicantId: FieldRef<"Friendship", 'Int'>
    readonly approverId: FieldRef<"Friendship", 'Int'>
    readonly status: FieldRef<"Friendship", 'String'>
    readonly createdAt: FieldRef<"Friendship", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Friendship findUnique
   */
  export type FriendshipFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Friendship
     */
    select?: FriendshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Friendship
     */
    omit?: FriendshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FriendshipInclude<ExtArgs> | null
    /**
     * Filter, which Friendship to fetch.
     */
    where: FriendshipWhereUniqueInput
  }

  /**
   * Friendship findUniqueOrThrow
   */
  export type FriendshipFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Friendship
     */
    select?: FriendshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Friendship
     */
    omit?: FriendshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FriendshipInclude<ExtArgs> | null
    /**
     * Filter, which Friendship to fetch.
     */
    where: FriendshipWhereUniqueInput
  }

  /**
   * Friendship findFirst
   */
  export type FriendshipFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Friendship
     */
    select?: FriendshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Friendship
     */
    omit?: FriendshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FriendshipInclude<ExtArgs> | null
    /**
     * Filter, which Friendship to fetch.
     */
    where?: FriendshipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Friendships to fetch.
     */
    orderBy?: FriendshipOrderByWithRelationInput | FriendshipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Friendships.
     */
    cursor?: FriendshipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Friendships from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Friendships.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Friendships.
     */
    distinct?: FriendshipScalarFieldEnum | FriendshipScalarFieldEnum[]
  }

  /**
   * Friendship findFirstOrThrow
   */
  export type FriendshipFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Friendship
     */
    select?: FriendshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Friendship
     */
    omit?: FriendshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FriendshipInclude<ExtArgs> | null
    /**
     * Filter, which Friendship to fetch.
     */
    where?: FriendshipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Friendships to fetch.
     */
    orderBy?: FriendshipOrderByWithRelationInput | FriendshipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Friendships.
     */
    cursor?: FriendshipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Friendships from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Friendships.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Friendships.
     */
    distinct?: FriendshipScalarFieldEnum | FriendshipScalarFieldEnum[]
  }

  /**
   * Friendship findMany
   */
  export type FriendshipFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Friendship
     */
    select?: FriendshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Friendship
     */
    omit?: FriendshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FriendshipInclude<ExtArgs> | null
    /**
     * Filter, which Friendships to fetch.
     */
    where?: FriendshipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Friendships to fetch.
     */
    orderBy?: FriendshipOrderByWithRelationInput | FriendshipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Friendships.
     */
    cursor?: FriendshipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Friendships from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Friendships.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Friendships.
     */
    distinct?: FriendshipScalarFieldEnum | FriendshipScalarFieldEnum[]
  }

  /**
   * Friendship create
   */
  export type FriendshipCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Friendship
     */
    select?: FriendshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Friendship
     */
    omit?: FriendshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FriendshipInclude<ExtArgs> | null
    /**
     * The data needed to create a Friendship.
     */
    data: XOR<FriendshipCreateInput, FriendshipUncheckedCreateInput>
  }

  /**
   * Friendship createMany
   */
  export type FriendshipCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Friendships.
     */
    data: FriendshipCreateManyInput | FriendshipCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Friendship createManyAndReturn
   */
  export type FriendshipCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Friendship
     */
    select?: FriendshipSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Friendship
     */
    omit?: FriendshipOmit<ExtArgs> | null
    /**
     * The data used to create many Friendships.
     */
    data: FriendshipCreateManyInput | FriendshipCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FriendshipIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Friendship update
   */
  export type FriendshipUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Friendship
     */
    select?: FriendshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Friendship
     */
    omit?: FriendshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FriendshipInclude<ExtArgs> | null
    /**
     * The data needed to update a Friendship.
     */
    data: XOR<FriendshipUpdateInput, FriendshipUncheckedUpdateInput>
    /**
     * Choose, which Friendship to update.
     */
    where: FriendshipWhereUniqueInput
  }

  /**
   * Friendship updateMany
   */
  export type FriendshipUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Friendships.
     */
    data: XOR<FriendshipUpdateManyMutationInput, FriendshipUncheckedUpdateManyInput>
    /**
     * Filter which Friendships to update
     */
    where?: FriendshipWhereInput
    /**
     * Limit how many Friendships to update.
     */
    limit?: number
  }

  /**
   * Friendship updateManyAndReturn
   */
  export type FriendshipUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Friendship
     */
    select?: FriendshipSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Friendship
     */
    omit?: FriendshipOmit<ExtArgs> | null
    /**
     * The data used to update Friendships.
     */
    data: XOR<FriendshipUpdateManyMutationInput, FriendshipUncheckedUpdateManyInput>
    /**
     * Filter which Friendships to update
     */
    where?: FriendshipWhereInput
    /**
     * Limit how many Friendships to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FriendshipIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Friendship upsert
   */
  export type FriendshipUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Friendship
     */
    select?: FriendshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Friendship
     */
    omit?: FriendshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FriendshipInclude<ExtArgs> | null
    /**
     * The filter to search for the Friendship to update in case it exists.
     */
    where: FriendshipWhereUniqueInput
    /**
     * In case the Friendship found by the `where` argument doesn't exist, create a new Friendship with this data.
     */
    create: XOR<FriendshipCreateInput, FriendshipUncheckedCreateInput>
    /**
     * In case the Friendship was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FriendshipUpdateInput, FriendshipUncheckedUpdateInput>
  }

  /**
   * Friendship delete
   */
  export type FriendshipDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Friendship
     */
    select?: FriendshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Friendship
     */
    omit?: FriendshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FriendshipInclude<ExtArgs> | null
    /**
     * Filter which Friendship to delete.
     */
    where: FriendshipWhereUniqueInput
  }

  /**
   * Friendship deleteMany
   */
  export type FriendshipDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Friendships to delete
     */
    where?: FriendshipWhereInput
    /**
     * Limit how many Friendships to delete.
     */
    limit?: number
  }

  /**
   * Friendship without action
   */
  export type FriendshipDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Friendship
     */
    select?: FriendshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Friendship
     */
    omit?: FriendshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FriendshipInclude<ExtArgs> | null
  }


  /**
   * Model Block
   */

  export type AggregateBlock = {
    _count: BlockCountAggregateOutputType | null
    _avg: BlockAvgAggregateOutputType | null
    _sum: BlockSumAggregateOutputType | null
    _min: BlockMinAggregateOutputType | null
    _max: BlockMaxAggregateOutputType | null
  }

  export type BlockAvgAggregateOutputType = {
    id: number | null
    blockerId: number | null
    blockedId: number | null
  }

  export type BlockSumAggregateOutputType = {
    id: number | null
    blockerId: number | null
    blockedId: number | null
  }

  export type BlockMinAggregateOutputType = {
    id: number | null
    blockerId: number | null
    blockedId: number | null
    createdAt: Date | null
  }

  export type BlockMaxAggregateOutputType = {
    id: number | null
    blockerId: number | null
    blockedId: number | null
    createdAt: Date | null
  }

  export type BlockCountAggregateOutputType = {
    id: number
    blockerId: number
    blockedId: number
    createdAt: number
    _all: number
  }


  export type BlockAvgAggregateInputType = {
    id?: true
    blockerId?: true
    blockedId?: true
  }

  export type BlockSumAggregateInputType = {
    id?: true
    blockerId?: true
    blockedId?: true
  }

  export type BlockMinAggregateInputType = {
    id?: true
    blockerId?: true
    blockedId?: true
    createdAt?: true
  }

  export type BlockMaxAggregateInputType = {
    id?: true
    blockerId?: true
    blockedId?: true
    createdAt?: true
  }

  export type BlockCountAggregateInputType = {
    id?: true
    blockerId?: true
    blockedId?: true
    createdAt?: true
    _all?: true
  }

  export type BlockAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Block to aggregate.
     */
    where?: BlockWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Blocks to fetch.
     */
    orderBy?: BlockOrderByWithRelationInput | BlockOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BlockWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Blocks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Blocks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Blocks
    **/
    _count?: true | BlockCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BlockAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BlockSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BlockMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BlockMaxAggregateInputType
  }

  export type GetBlockAggregateType<T extends BlockAggregateArgs> = {
        [P in keyof T & keyof AggregateBlock]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBlock[P]>
      : GetScalarType<T[P], AggregateBlock[P]>
  }




  export type BlockGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BlockWhereInput
    orderBy?: BlockOrderByWithAggregationInput | BlockOrderByWithAggregationInput[]
    by: BlockScalarFieldEnum[] | BlockScalarFieldEnum
    having?: BlockScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BlockCountAggregateInputType | true
    _avg?: BlockAvgAggregateInputType
    _sum?: BlockSumAggregateInputType
    _min?: BlockMinAggregateInputType
    _max?: BlockMaxAggregateInputType
  }

  export type BlockGroupByOutputType = {
    id: number
    blockerId: number
    blockedId: number
    createdAt: Date
    _count: BlockCountAggregateOutputType | null
    _avg: BlockAvgAggregateOutputType | null
    _sum: BlockSumAggregateOutputType | null
    _min: BlockMinAggregateOutputType | null
    _max: BlockMaxAggregateOutputType | null
  }

  type GetBlockGroupByPayload<T extends BlockGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BlockGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BlockGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BlockGroupByOutputType[P]>
            : GetScalarType<T[P], BlockGroupByOutputType[P]>
        }
      >
    >


  export type BlockSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    blockerId?: boolean
    blockedId?: boolean
    createdAt?: boolean
    blocker?: boolean | UserDefaultArgs<ExtArgs>
    blocked?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["block"]>

  export type BlockSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    blockerId?: boolean
    blockedId?: boolean
    createdAt?: boolean
    blocker?: boolean | UserDefaultArgs<ExtArgs>
    blocked?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["block"]>

  export type BlockSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    blockerId?: boolean
    blockedId?: boolean
    createdAt?: boolean
    blocker?: boolean | UserDefaultArgs<ExtArgs>
    blocked?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["block"]>

  export type BlockSelectScalar = {
    id?: boolean
    blockerId?: boolean
    blockedId?: boolean
    createdAt?: boolean
  }

  export type BlockOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "blockerId" | "blockedId" | "createdAt", ExtArgs["result"]["block"]>
  export type BlockInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    blocker?: boolean | UserDefaultArgs<ExtArgs>
    blocked?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type BlockIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    blocker?: boolean | UserDefaultArgs<ExtArgs>
    blocked?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type BlockIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    blocker?: boolean | UserDefaultArgs<ExtArgs>
    blocked?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $BlockPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Block"
    objects: {
      blocker: Prisma.$UserPayload<ExtArgs>
      blocked: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      blockerId: number
      blockedId: number
      createdAt: Date
    }, ExtArgs["result"]["block"]>
    composites: {}
  }

  type BlockGetPayload<S extends boolean | null | undefined | BlockDefaultArgs> = $Result.GetResult<Prisma.$BlockPayload, S>

  type BlockCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BlockFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BlockCountAggregateInputType | true
    }

  export interface BlockDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Block'], meta: { name: 'Block' } }
    /**
     * Find zero or one Block that matches the filter.
     * @param {BlockFindUniqueArgs} args - Arguments to find a Block
     * @example
     * // Get one Block
     * const block = await prisma.block.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BlockFindUniqueArgs>(args: SelectSubset<T, BlockFindUniqueArgs<ExtArgs>>): Prisma__BlockClient<$Result.GetResult<Prisma.$BlockPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Block that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BlockFindUniqueOrThrowArgs} args - Arguments to find a Block
     * @example
     * // Get one Block
     * const block = await prisma.block.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BlockFindUniqueOrThrowArgs>(args: SelectSubset<T, BlockFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BlockClient<$Result.GetResult<Prisma.$BlockPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Block that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlockFindFirstArgs} args - Arguments to find a Block
     * @example
     * // Get one Block
     * const block = await prisma.block.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BlockFindFirstArgs>(args?: SelectSubset<T, BlockFindFirstArgs<ExtArgs>>): Prisma__BlockClient<$Result.GetResult<Prisma.$BlockPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Block that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlockFindFirstOrThrowArgs} args - Arguments to find a Block
     * @example
     * // Get one Block
     * const block = await prisma.block.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BlockFindFirstOrThrowArgs>(args?: SelectSubset<T, BlockFindFirstOrThrowArgs<ExtArgs>>): Prisma__BlockClient<$Result.GetResult<Prisma.$BlockPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Blocks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlockFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Blocks
     * const blocks = await prisma.block.findMany()
     * 
     * // Get first 10 Blocks
     * const blocks = await prisma.block.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const blockWithIdOnly = await prisma.block.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BlockFindManyArgs>(args?: SelectSubset<T, BlockFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BlockPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Block.
     * @param {BlockCreateArgs} args - Arguments to create a Block.
     * @example
     * // Create one Block
     * const Block = await prisma.block.create({
     *   data: {
     *     // ... data to create a Block
     *   }
     * })
     * 
     */
    create<T extends BlockCreateArgs>(args: SelectSubset<T, BlockCreateArgs<ExtArgs>>): Prisma__BlockClient<$Result.GetResult<Prisma.$BlockPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Blocks.
     * @param {BlockCreateManyArgs} args - Arguments to create many Blocks.
     * @example
     * // Create many Blocks
     * const block = await prisma.block.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BlockCreateManyArgs>(args?: SelectSubset<T, BlockCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Blocks and returns the data saved in the database.
     * @param {BlockCreateManyAndReturnArgs} args - Arguments to create many Blocks.
     * @example
     * // Create many Blocks
     * const block = await prisma.block.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Blocks and only return the `id`
     * const blockWithIdOnly = await prisma.block.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BlockCreateManyAndReturnArgs>(args?: SelectSubset<T, BlockCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BlockPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Block.
     * @param {BlockDeleteArgs} args - Arguments to delete one Block.
     * @example
     * // Delete one Block
     * const Block = await prisma.block.delete({
     *   where: {
     *     // ... filter to delete one Block
     *   }
     * })
     * 
     */
    delete<T extends BlockDeleteArgs>(args: SelectSubset<T, BlockDeleteArgs<ExtArgs>>): Prisma__BlockClient<$Result.GetResult<Prisma.$BlockPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Block.
     * @param {BlockUpdateArgs} args - Arguments to update one Block.
     * @example
     * // Update one Block
     * const block = await prisma.block.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BlockUpdateArgs>(args: SelectSubset<T, BlockUpdateArgs<ExtArgs>>): Prisma__BlockClient<$Result.GetResult<Prisma.$BlockPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Blocks.
     * @param {BlockDeleteManyArgs} args - Arguments to filter Blocks to delete.
     * @example
     * // Delete a few Blocks
     * const { count } = await prisma.block.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BlockDeleteManyArgs>(args?: SelectSubset<T, BlockDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Blocks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlockUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Blocks
     * const block = await prisma.block.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BlockUpdateManyArgs>(args: SelectSubset<T, BlockUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Blocks and returns the data updated in the database.
     * @param {BlockUpdateManyAndReturnArgs} args - Arguments to update many Blocks.
     * @example
     * // Update many Blocks
     * const block = await prisma.block.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Blocks and only return the `id`
     * const blockWithIdOnly = await prisma.block.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BlockUpdateManyAndReturnArgs>(args: SelectSubset<T, BlockUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BlockPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Block.
     * @param {BlockUpsertArgs} args - Arguments to update or create a Block.
     * @example
     * // Update or create a Block
     * const block = await prisma.block.upsert({
     *   create: {
     *     // ... data to create a Block
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Block we want to update
     *   }
     * })
     */
    upsert<T extends BlockUpsertArgs>(args: SelectSubset<T, BlockUpsertArgs<ExtArgs>>): Prisma__BlockClient<$Result.GetResult<Prisma.$BlockPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Blocks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlockCountArgs} args - Arguments to filter Blocks to count.
     * @example
     * // Count the number of Blocks
     * const count = await prisma.block.count({
     *   where: {
     *     // ... the filter for the Blocks we want to count
     *   }
     * })
    **/
    count<T extends BlockCountArgs>(
      args?: Subset<T, BlockCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BlockCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Block.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlockAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BlockAggregateArgs>(args: Subset<T, BlockAggregateArgs>): Prisma.PrismaPromise<GetBlockAggregateType<T>>

    /**
     * Group by Block.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlockGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BlockGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BlockGroupByArgs['orderBy'] }
        : { orderBy?: BlockGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BlockGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBlockGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Block model
   */
  readonly fields: BlockFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Block.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BlockClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    blocker<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    blocked<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Block model
   */
  interface BlockFieldRefs {
    readonly id: FieldRef<"Block", 'Int'>
    readonly blockerId: FieldRef<"Block", 'Int'>
    readonly blockedId: FieldRef<"Block", 'Int'>
    readonly createdAt: FieldRef<"Block", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Block findUnique
   */
  export type BlockFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Block
     */
    select?: BlockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Block
     */
    omit?: BlockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlockInclude<ExtArgs> | null
    /**
     * Filter, which Block to fetch.
     */
    where: BlockWhereUniqueInput
  }

  /**
   * Block findUniqueOrThrow
   */
  export type BlockFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Block
     */
    select?: BlockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Block
     */
    omit?: BlockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlockInclude<ExtArgs> | null
    /**
     * Filter, which Block to fetch.
     */
    where: BlockWhereUniqueInput
  }

  /**
   * Block findFirst
   */
  export type BlockFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Block
     */
    select?: BlockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Block
     */
    omit?: BlockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlockInclude<ExtArgs> | null
    /**
     * Filter, which Block to fetch.
     */
    where?: BlockWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Blocks to fetch.
     */
    orderBy?: BlockOrderByWithRelationInput | BlockOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Blocks.
     */
    cursor?: BlockWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Blocks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Blocks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Blocks.
     */
    distinct?: BlockScalarFieldEnum | BlockScalarFieldEnum[]
  }

  /**
   * Block findFirstOrThrow
   */
  export type BlockFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Block
     */
    select?: BlockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Block
     */
    omit?: BlockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlockInclude<ExtArgs> | null
    /**
     * Filter, which Block to fetch.
     */
    where?: BlockWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Blocks to fetch.
     */
    orderBy?: BlockOrderByWithRelationInput | BlockOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Blocks.
     */
    cursor?: BlockWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Blocks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Blocks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Blocks.
     */
    distinct?: BlockScalarFieldEnum | BlockScalarFieldEnum[]
  }

  /**
   * Block findMany
   */
  export type BlockFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Block
     */
    select?: BlockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Block
     */
    omit?: BlockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlockInclude<ExtArgs> | null
    /**
     * Filter, which Blocks to fetch.
     */
    where?: BlockWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Blocks to fetch.
     */
    orderBy?: BlockOrderByWithRelationInput | BlockOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Blocks.
     */
    cursor?: BlockWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Blocks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Blocks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Blocks.
     */
    distinct?: BlockScalarFieldEnum | BlockScalarFieldEnum[]
  }

  /**
   * Block create
   */
  export type BlockCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Block
     */
    select?: BlockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Block
     */
    omit?: BlockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlockInclude<ExtArgs> | null
    /**
     * The data needed to create a Block.
     */
    data: XOR<BlockCreateInput, BlockUncheckedCreateInput>
  }

  /**
   * Block createMany
   */
  export type BlockCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Blocks.
     */
    data: BlockCreateManyInput | BlockCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Block createManyAndReturn
   */
  export type BlockCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Block
     */
    select?: BlockSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Block
     */
    omit?: BlockOmit<ExtArgs> | null
    /**
     * The data used to create many Blocks.
     */
    data: BlockCreateManyInput | BlockCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlockIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Block update
   */
  export type BlockUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Block
     */
    select?: BlockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Block
     */
    omit?: BlockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlockInclude<ExtArgs> | null
    /**
     * The data needed to update a Block.
     */
    data: XOR<BlockUpdateInput, BlockUncheckedUpdateInput>
    /**
     * Choose, which Block to update.
     */
    where: BlockWhereUniqueInput
  }

  /**
   * Block updateMany
   */
  export type BlockUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Blocks.
     */
    data: XOR<BlockUpdateManyMutationInput, BlockUncheckedUpdateManyInput>
    /**
     * Filter which Blocks to update
     */
    where?: BlockWhereInput
    /**
     * Limit how many Blocks to update.
     */
    limit?: number
  }

  /**
   * Block updateManyAndReturn
   */
  export type BlockUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Block
     */
    select?: BlockSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Block
     */
    omit?: BlockOmit<ExtArgs> | null
    /**
     * The data used to update Blocks.
     */
    data: XOR<BlockUpdateManyMutationInput, BlockUncheckedUpdateManyInput>
    /**
     * Filter which Blocks to update
     */
    where?: BlockWhereInput
    /**
     * Limit how many Blocks to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlockIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Block upsert
   */
  export type BlockUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Block
     */
    select?: BlockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Block
     */
    omit?: BlockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlockInclude<ExtArgs> | null
    /**
     * The filter to search for the Block to update in case it exists.
     */
    where: BlockWhereUniqueInput
    /**
     * In case the Block found by the `where` argument doesn't exist, create a new Block with this data.
     */
    create: XOR<BlockCreateInput, BlockUncheckedCreateInput>
    /**
     * In case the Block was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BlockUpdateInput, BlockUncheckedUpdateInput>
  }

  /**
   * Block delete
   */
  export type BlockDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Block
     */
    select?: BlockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Block
     */
    omit?: BlockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlockInclude<ExtArgs> | null
    /**
     * Filter which Block to delete.
     */
    where: BlockWhereUniqueInput
  }

  /**
   * Block deleteMany
   */
  export type BlockDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Blocks to delete
     */
    where?: BlockWhereInput
    /**
     * Limit how many Blocks to delete.
     */
    limit?: number
  }

  /**
   * Block without action
   */
  export type BlockDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Block
     */
    select?: BlockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Block
     */
    omit?: BlockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlockInclude<ExtArgs> | null
  }


  /**
   * Model DirectMessage
   */

  export type AggregateDirectMessage = {
    _count: DirectMessageCountAggregateOutputType | null
    _avg: DirectMessageAvgAggregateOutputType | null
    _sum: DirectMessageSumAggregateOutputType | null
    _min: DirectMessageMinAggregateOutputType | null
    _max: DirectMessageMaxAggregateOutputType | null
  }

  export type DirectMessageAvgAggregateOutputType = {
    id: number | null
    senderId: number | null
    receiverId: number | null
  }

  export type DirectMessageSumAggregateOutputType = {
    id: number | null
    senderId: number | null
    receiverId: number | null
  }

  export type DirectMessageMinAggregateOutputType = {
    id: number | null
    senderId: number | null
    receiverId: number | null
    content: string | null
    createdAt: Date | null
  }

  export type DirectMessageMaxAggregateOutputType = {
    id: number | null
    senderId: number | null
    receiverId: number | null
    content: string | null
    createdAt: Date | null
  }

  export type DirectMessageCountAggregateOutputType = {
    id: number
    senderId: number
    receiverId: number
    content: number
    createdAt: number
    _all: number
  }


  export type DirectMessageAvgAggregateInputType = {
    id?: true
    senderId?: true
    receiverId?: true
  }

  export type DirectMessageSumAggregateInputType = {
    id?: true
    senderId?: true
    receiverId?: true
  }

  export type DirectMessageMinAggregateInputType = {
    id?: true
    senderId?: true
    receiverId?: true
    content?: true
    createdAt?: true
  }

  export type DirectMessageMaxAggregateInputType = {
    id?: true
    senderId?: true
    receiverId?: true
    content?: true
    createdAt?: true
  }

  export type DirectMessageCountAggregateInputType = {
    id?: true
    senderId?: true
    receiverId?: true
    content?: true
    createdAt?: true
    _all?: true
  }

  export type DirectMessageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DirectMessage to aggregate.
     */
    where?: DirectMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DirectMessages to fetch.
     */
    orderBy?: DirectMessageOrderByWithRelationInput | DirectMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DirectMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DirectMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DirectMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DirectMessages
    **/
    _count?: true | DirectMessageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DirectMessageAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DirectMessageSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DirectMessageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DirectMessageMaxAggregateInputType
  }

  export type GetDirectMessageAggregateType<T extends DirectMessageAggregateArgs> = {
        [P in keyof T & keyof AggregateDirectMessage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDirectMessage[P]>
      : GetScalarType<T[P], AggregateDirectMessage[P]>
  }




  export type DirectMessageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DirectMessageWhereInput
    orderBy?: DirectMessageOrderByWithAggregationInput | DirectMessageOrderByWithAggregationInput[]
    by: DirectMessageScalarFieldEnum[] | DirectMessageScalarFieldEnum
    having?: DirectMessageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DirectMessageCountAggregateInputType | true
    _avg?: DirectMessageAvgAggregateInputType
    _sum?: DirectMessageSumAggregateInputType
    _min?: DirectMessageMinAggregateInputType
    _max?: DirectMessageMaxAggregateInputType
  }

  export type DirectMessageGroupByOutputType = {
    id: number
    senderId: number
    receiverId: number
    content: string
    createdAt: Date
    _count: DirectMessageCountAggregateOutputType | null
    _avg: DirectMessageAvgAggregateOutputType | null
    _sum: DirectMessageSumAggregateOutputType | null
    _min: DirectMessageMinAggregateOutputType | null
    _max: DirectMessageMaxAggregateOutputType | null
  }

  type GetDirectMessageGroupByPayload<T extends DirectMessageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DirectMessageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DirectMessageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DirectMessageGroupByOutputType[P]>
            : GetScalarType<T[P], DirectMessageGroupByOutputType[P]>
        }
      >
    >


  export type DirectMessageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    senderId?: boolean
    receiverId?: boolean
    content?: boolean
    createdAt?: boolean
    sender?: boolean | UserDefaultArgs<ExtArgs>
    receiver?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["directMessage"]>

  export type DirectMessageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    senderId?: boolean
    receiverId?: boolean
    content?: boolean
    createdAt?: boolean
    sender?: boolean | UserDefaultArgs<ExtArgs>
    receiver?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["directMessage"]>

  export type DirectMessageSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    senderId?: boolean
    receiverId?: boolean
    content?: boolean
    createdAt?: boolean
    sender?: boolean | UserDefaultArgs<ExtArgs>
    receiver?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["directMessage"]>

  export type DirectMessageSelectScalar = {
    id?: boolean
    senderId?: boolean
    receiverId?: boolean
    content?: boolean
    createdAt?: boolean
  }

  export type DirectMessageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "senderId" | "receiverId" | "content" | "createdAt", ExtArgs["result"]["directMessage"]>
  export type DirectMessageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sender?: boolean | UserDefaultArgs<ExtArgs>
    receiver?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type DirectMessageIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sender?: boolean | UserDefaultArgs<ExtArgs>
    receiver?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type DirectMessageIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sender?: boolean | UserDefaultArgs<ExtArgs>
    receiver?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $DirectMessagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DirectMessage"
    objects: {
      sender: Prisma.$UserPayload<ExtArgs>
      receiver: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      senderId: number
      receiverId: number
      content: string
      createdAt: Date
    }, ExtArgs["result"]["directMessage"]>
    composites: {}
  }

  type DirectMessageGetPayload<S extends boolean | null | undefined | DirectMessageDefaultArgs> = $Result.GetResult<Prisma.$DirectMessagePayload, S>

  type DirectMessageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DirectMessageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DirectMessageCountAggregateInputType | true
    }

  export interface DirectMessageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DirectMessage'], meta: { name: 'DirectMessage' } }
    /**
     * Find zero or one DirectMessage that matches the filter.
     * @param {DirectMessageFindUniqueArgs} args - Arguments to find a DirectMessage
     * @example
     * // Get one DirectMessage
     * const directMessage = await prisma.directMessage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DirectMessageFindUniqueArgs>(args: SelectSubset<T, DirectMessageFindUniqueArgs<ExtArgs>>): Prisma__DirectMessageClient<$Result.GetResult<Prisma.$DirectMessagePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DirectMessage that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DirectMessageFindUniqueOrThrowArgs} args - Arguments to find a DirectMessage
     * @example
     * // Get one DirectMessage
     * const directMessage = await prisma.directMessage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DirectMessageFindUniqueOrThrowArgs>(args: SelectSubset<T, DirectMessageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DirectMessageClient<$Result.GetResult<Prisma.$DirectMessagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DirectMessage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DirectMessageFindFirstArgs} args - Arguments to find a DirectMessage
     * @example
     * // Get one DirectMessage
     * const directMessage = await prisma.directMessage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DirectMessageFindFirstArgs>(args?: SelectSubset<T, DirectMessageFindFirstArgs<ExtArgs>>): Prisma__DirectMessageClient<$Result.GetResult<Prisma.$DirectMessagePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DirectMessage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DirectMessageFindFirstOrThrowArgs} args - Arguments to find a DirectMessage
     * @example
     * // Get one DirectMessage
     * const directMessage = await prisma.directMessage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DirectMessageFindFirstOrThrowArgs>(args?: SelectSubset<T, DirectMessageFindFirstOrThrowArgs<ExtArgs>>): Prisma__DirectMessageClient<$Result.GetResult<Prisma.$DirectMessagePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DirectMessages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DirectMessageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DirectMessages
     * const directMessages = await prisma.directMessage.findMany()
     * 
     * // Get first 10 DirectMessages
     * const directMessages = await prisma.directMessage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const directMessageWithIdOnly = await prisma.directMessage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DirectMessageFindManyArgs>(args?: SelectSubset<T, DirectMessageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DirectMessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DirectMessage.
     * @param {DirectMessageCreateArgs} args - Arguments to create a DirectMessage.
     * @example
     * // Create one DirectMessage
     * const DirectMessage = await prisma.directMessage.create({
     *   data: {
     *     // ... data to create a DirectMessage
     *   }
     * })
     * 
     */
    create<T extends DirectMessageCreateArgs>(args: SelectSubset<T, DirectMessageCreateArgs<ExtArgs>>): Prisma__DirectMessageClient<$Result.GetResult<Prisma.$DirectMessagePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DirectMessages.
     * @param {DirectMessageCreateManyArgs} args - Arguments to create many DirectMessages.
     * @example
     * // Create many DirectMessages
     * const directMessage = await prisma.directMessage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DirectMessageCreateManyArgs>(args?: SelectSubset<T, DirectMessageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DirectMessages and returns the data saved in the database.
     * @param {DirectMessageCreateManyAndReturnArgs} args - Arguments to create many DirectMessages.
     * @example
     * // Create many DirectMessages
     * const directMessage = await prisma.directMessage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DirectMessages and only return the `id`
     * const directMessageWithIdOnly = await prisma.directMessage.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DirectMessageCreateManyAndReturnArgs>(args?: SelectSubset<T, DirectMessageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DirectMessagePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DirectMessage.
     * @param {DirectMessageDeleteArgs} args - Arguments to delete one DirectMessage.
     * @example
     * // Delete one DirectMessage
     * const DirectMessage = await prisma.directMessage.delete({
     *   where: {
     *     // ... filter to delete one DirectMessage
     *   }
     * })
     * 
     */
    delete<T extends DirectMessageDeleteArgs>(args: SelectSubset<T, DirectMessageDeleteArgs<ExtArgs>>): Prisma__DirectMessageClient<$Result.GetResult<Prisma.$DirectMessagePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DirectMessage.
     * @param {DirectMessageUpdateArgs} args - Arguments to update one DirectMessage.
     * @example
     * // Update one DirectMessage
     * const directMessage = await prisma.directMessage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DirectMessageUpdateArgs>(args: SelectSubset<T, DirectMessageUpdateArgs<ExtArgs>>): Prisma__DirectMessageClient<$Result.GetResult<Prisma.$DirectMessagePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DirectMessages.
     * @param {DirectMessageDeleteManyArgs} args - Arguments to filter DirectMessages to delete.
     * @example
     * // Delete a few DirectMessages
     * const { count } = await prisma.directMessage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DirectMessageDeleteManyArgs>(args?: SelectSubset<T, DirectMessageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DirectMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DirectMessageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DirectMessages
     * const directMessage = await prisma.directMessage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DirectMessageUpdateManyArgs>(args: SelectSubset<T, DirectMessageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DirectMessages and returns the data updated in the database.
     * @param {DirectMessageUpdateManyAndReturnArgs} args - Arguments to update many DirectMessages.
     * @example
     * // Update many DirectMessages
     * const directMessage = await prisma.directMessage.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DirectMessages and only return the `id`
     * const directMessageWithIdOnly = await prisma.directMessage.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DirectMessageUpdateManyAndReturnArgs>(args: SelectSubset<T, DirectMessageUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DirectMessagePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DirectMessage.
     * @param {DirectMessageUpsertArgs} args - Arguments to update or create a DirectMessage.
     * @example
     * // Update or create a DirectMessage
     * const directMessage = await prisma.directMessage.upsert({
     *   create: {
     *     // ... data to create a DirectMessage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DirectMessage we want to update
     *   }
     * })
     */
    upsert<T extends DirectMessageUpsertArgs>(args: SelectSubset<T, DirectMessageUpsertArgs<ExtArgs>>): Prisma__DirectMessageClient<$Result.GetResult<Prisma.$DirectMessagePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DirectMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DirectMessageCountArgs} args - Arguments to filter DirectMessages to count.
     * @example
     * // Count the number of DirectMessages
     * const count = await prisma.directMessage.count({
     *   where: {
     *     // ... the filter for the DirectMessages we want to count
     *   }
     * })
    **/
    count<T extends DirectMessageCountArgs>(
      args?: Subset<T, DirectMessageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DirectMessageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DirectMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DirectMessageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DirectMessageAggregateArgs>(args: Subset<T, DirectMessageAggregateArgs>): Prisma.PrismaPromise<GetDirectMessageAggregateType<T>>

    /**
     * Group by DirectMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DirectMessageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DirectMessageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DirectMessageGroupByArgs['orderBy'] }
        : { orderBy?: DirectMessageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DirectMessageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDirectMessageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DirectMessage model
   */
  readonly fields: DirectMessageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DirectMessage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DirectMessageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    sender<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    receiver<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DirectMessage model
   */
  interface DirectMessageFieldRefs {
    readonly id: FieldRef<"DirectMessage", 'Int'>
    readonly senderId: FieldRef<"DirectMessage", 'Int'>
    readonly receiverId: FieldRef<"DirectMessage", 'Int'>
    readonly content: FieldRef<"DirectMessage", 'String'>
    readonly createdAt: FieldRef<"DirectMessage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DirectMessage findUnique
   */
  export type DirectMessageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DirectMessage
     */
    select?: DirectMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DirectMessage
     */
    omit?: DirectMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DirectMessageInclude<ExtArgs> | null
    /**
     * Filter, which DirectMessage to fetch.
     */
    where: DirectMessageWhereUniqueInput
  }

  /**
   * DirectMessage findUniqueOrThrow
   */
  export type DirectMessageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DirectMessage
     */
    select?: DirectMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DirectMessage
     */
    omit?: DirectMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DirectMessageInclude<ExtArgs> | null
    /**
     * Filter, which DirectMessage to fetch.
     */
    where: DirectMessageWhereUniqueInput
  }

  /**
   * DirectMessage findFirst
   */
  export type DirectMessageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DirectMessage
     */
    select?: DirectMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DirectMessage
     */
    omit?: DirectMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DirectMessageInclude<ExtArgs> | null
    /**
     * Filter, which DirectMessage to fetch.
     */
    where?: DirectMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DirectMessages to fetch.
     */
    orderBy?: DirectMessageOrderByWithRelationInput | DirectMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DirectMessages.
     */
    cursor?: DirectMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DirectMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DirectMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DirectMessages.
     */
    distinct?: DirectMessageScalarFieldEnum | DirectMessageScalarFieldEnum[]
  }

  /**
   * DirectMessage findFirstOrThrow
   */
  export type DirectMessageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DirectMessage
     */
    select?: DirectMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DirectMessage
     */
    omit?: DirectMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DirectMessageInclude<ExtArgs> | null
    /**
     * Filter, which DirectMessage to fetch.
     */
    where?: DirectMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DirectMessages to fetch.
     */
    orderBy?: DirectMessageOrderByWithRelationInput | DirectMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DirectMessages.
     */
    cursor?: DirectMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DirectMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DirectMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DirectMessages.
     */
    distinct?: DirectMessageScalarFieldEnum | DirectMessageScalarFieldEnum[]
  }

  /**
   * DirectMessage findMany
   */
  export type DirectMessageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DirectMessage
     */
    select?: DirectMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DirectMessage
     */
    omit?: DirectMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DirectMessageInclude<ExtArgs> | null
    /**
     * Filter, which DirectMessages to fetch.
     */
    where?: DirectMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DirectMessages to fetch.
     */
    orderBy?: DirectMessageOrderByWithRelationInput | DirectMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DirectMessages.
     */
    cursor?: DirectMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DirectMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DirectMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DirectMessages.
     */
    distinct?: DirectMessageScalarFieldEnum | DirectMessageScalarFieldEnum[]
  }

  /**
   * DirectMessage create
   */
  export type DirectMessageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DirectMessage
     */
    select?: DirectMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DirectMessage
     */
    omit?: DirectMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DirectMessageInclude<ExtArgs> | null
    /**
     * The data needed to create a DirectMessage.
     */
    data: XOR<DirectMessageCreateInput, DirectMessageUncheckedCreateInput>
  }

  /**
   * DirectMessage createMany
   */
  export type DirectMessageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DirectMessages.
     */
    data: DirectMessageCreateManyInput | DirectMessageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DirectMessage createManyAndReturn
   */
  export type DirectMessageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DirectMessage
     */
    select?: DirectMessageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DirectMessage
     */
    omit?: DirectMessageOmit<ExtArgs> | null
    /**
     * The data used to create many DirectMessages.
     */
    data: DirectMessageCreateManyInput | DirectMessageCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DirectMessageIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * DirectMessage update
   */
  export type DirectMessageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DirectMessage
     */
    select?: DirectMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DirectMessage
     */
    omit?: DirectMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DirectMessageInclude<ExtArgs> | null
    /**
     * The data needed to update a DirectMessage.
     */
    data: XOR<DirectMessageUpdateInput, DirectMessageUncheckedUpdateInput>
    /**
     * Choose, which DirectMessage to update.
     */
    where: DirectMessageWhereUniqueInput
  }

  /**
   * DirectMessage updateMany
   */
  export type DirectMessageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DirectMessages.
     */
    data: XOR<DirectMessageUpdateManyMutationInput, DirectMessageUncheckedUpdateManyInput>
    /**
     * Filter which DirectMessages to update
     */
    where?: DirectMessageWhereInput
    /**
     * Limit how many DirectMessages to update.
     */
    limit?: number
  }

  /**
   * DirectMessage updateManyAndReturn
   */
  export type DirectMessageUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DirectMessage
     */
    select?: DirectMessageSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DirectMessage
     */
    omit?: DirectMessageOmit<ExtArgs> | null
    /**
     * The data used to update DirectMessages.
     */
    data: XOR<DirectMessageUpdateManyMutationInput, DirectMessageUncheckedUpdateManyInput>
    /**
     * Filter which DirectMessages to update
     */
    where?: DirectMessageWhereInput
    /**
     * Limit how many DirectMessages to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DirectMessageIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * DirectMessage upsert
   */
  export type DirectMessageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DirectMessage
     */
    select?: DirectMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DirectMessage
     */
    omit?: DirectMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DirectMessageInclude<ExtArgs> | null
    /**
     * The filter to search for the DirectMessage to update in case it exists.
     */
    where: DirectMessageWhereUniqueInput
    /**
     * In case the DirectMessage found by the `where` argument doesn't exist, create a new DirectMessage with this data.
     */
    create: XOR<DirectMessageCreateInput, DirectMessageUncheckedCreateInput>
    /**
     * In case the DirectMessage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DirectMessageUpdateInput, DirectMessageUncheckedUpdateInput>
  }

  /**
   * DirectMessage delete
   */
  export type DirectMessageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DirectMessage
     */
    select?: DirectMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DirectMessage
     */
    omit?: DirectMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DirectMessageInclude<ExtArgs> | null
    /**
     * Filter which DirectMessage to delete.
     */
    where: DirectMessageWhereUniqueInput
  }

  /**
   * DirectMessage deleteMany
   */
  export type DirectMessageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DirectMessages to delete
     */
    where?: DirectMessageWhereInput
    /**
     * Limit how many DirectMessages to delete.
     */
    limit?: number
  }

  /**
   * DirectMessage without action
   */
  export type DirectMessageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DirectMessage
     */
    select?: DirectMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DirectMessage
     */
    omit?: DirectMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DirectMessageInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    password: 'password',
    username: 'username',
    profileImage: 'profileImage',
    bio: 'bio'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const ItoGameRecordScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    totalGames: 'totalGames',
    successCount: 'successCount'
  };

  export type ItoGameRecordScalarFieldEnum = (typeof ItoGameRecordScalarFieldEnum)[keyof typeof ItoGameRecordScalarFieldEnum]


  export const FriendshipScalarFieldEnum: {
    id: 'id',
    applicantId: 'applicantId',
    approverId: 'approverId',
    status: 'status',
    createdAt: 'createdAt'
  };

  export type FriendshipScalarFieldEnum = (typeof FriendshipScalarFieldEnum)[keyof typeof FriendshipScalarFieldEnum]


  export const BlockScalarFieldEnum: {
    id: 'id',
    blockerId: 'blockerId',
    blockedId: 'blockedId',
    createdAt: 'createdAt'
  };

  export type BlockScalarFieldEnum = (typeof BlockScalarFieldEnum)[keyof typeof BlockScalarFieldEnum]


  export const DirectMessageScalarFieldEnum: {
    id: 'id',
    senderId: 'senderId',
    receiverId: 'receiverId',
    content: 'content',
    createdAt: 'createdAt'
  };

  export type DirectMessageScalarFieldEnum = (typeof DirectMessageScalarFieldEnum)[keyof typeof DirectMessageScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: IntFilter<"User"> | number
    email?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    username?: StringFilter<"User"> | string
    profileImage?: StringNullableFilter<"User"> | string | null
    bio?: StringNullableFilter<"User"> | string | null
    gameRecord?: XOR<ItoGameRecordNullableScalarRelationFilter, ItoGameRecordWhereInput> | null
    sentMessages?: DirectMessageListRelationFilter
    receivedMessages?: DirectMessageListRelationFilter
    appliedFriendships?: FriendshipListRelationFilter
    receivedFriendships?: FriendshipListRelationFilter
    blocksMade?: BlockListRelationFilter
    blocksReceived?: BlockListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    username?: SortOrder
    profileImage?: SortOrderInput | SortOrder
    bio?: SortOrderInput | SortOrder
    gameRecord?: ItoGameRecordOrderByWithRelationInput
    sentMessages?: DirectMessageOrderByRelationAggregateInput
    receivedMessages?: DirectMessageOrderByRelationAggregateInput
    appliedFriendships?: FriendshipOrderByRelationAggregateInput
    receivedFriendships?: FriendshipOrderByRelationAggregateInput
    blocksMade?: BlockOrderByRelationAggregateInput
    blocksReceived?: BlockOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    email?: string
    username?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    password?: StringFilter<"User"> | string
    profileImage?: StringNullableFilter<"User"> | string | null
    bio?: StringNullableFilter<"User"> | string | null
    gameRecord?: XOR<ItoGameRecordNullableScalarRelationFilter, ItoGameRecordWhereInput> | null
    sentMessages?: DirectMessageListRelationFilter
    receivedMessages?: DirectMessageListRelationFilter
    appliedFriendships?: FriendshipListRelationFilter
    receivedFriendships?: FriendshipListRelationFilter
    blocksMade?: BlockListRelationFilter
    blocksReceived?: BlockListRelationFilter
  }, "id" | "email" | "username">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    username?: SortOrder
    profileImage?: SortOrderInput | SortOrder
    bio?: SortOrderInput | SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"User"> | number
    email?: StringWithAggregatesFilter<"User"> | string
    password?: StringWithAggregatesFilter<"User"> | string
    username?: StringWithAggregatesFilter<"User"> | string
    profileImage?: StringNullableWithAggregatesFilter<"User"> | string | null
    bio?: StringNullableWithAggregatesFilter<"User"> | string | null
  }

  export type ItoGameRecordWhereInput = {
    AND?: ItoGameRecordWhereInput | ItoGameRecordWhereInput[]
    OR?: ItoGameRecordWhereInput[]
    NOT?: ItoGameRecordWhereInput | ItoGameRecordWhereInput[]
    id?: IntFilter<"ItoGameRecord"> | number
    userId?: IntFilter<"ItoGameRecord"> | number
    totalGames?: IntFilter<"ItoGameRecord"> | number
    successCount?: IntFilter<"ItoGameRecord"> | number
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type ItoGameRecordOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    totalGames?: SortOrder
    successCount?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type ItoGameRecordWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    userId?: number
    AND?: ItoGameRecordWhereInput | ItoGameRecordWhereInput[]
    OR?: ItoGameRecordWhereInput[]
    NOT?: ItoGameRecordWhereInput | ItoGameRecordWhereInput[]
    totalGames?: IntFilter<"ItoGameRecord"> | number
    successCount?: IntFilter<"ItoGameRecord"> | number
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "userId">

  export type ItoGameRecordOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    totalGames?: SortOrder
    successCount?: SortOrder
    _count?: ItoGameRecordCountOrderByAggregateInput
    _avg?: ItoGameRecordAvgOrderByAggregateInput
    _max?: ItoGameRecordMaxOrderByAggregateInput
    _min?: ItoGameRecordMinOrderByAggregateInput
    _sum?: ItoGameRecordSumOrderByAggregateInput
  }

  export type ItoGameRecordScalarWhereWithAggregatesInput = {
    AND?: ItoGameRecordScalarWhereWithAggregatesInput | ItoGameRecordScalarWhereWithAggregatesInput[]
    OR?: ItoGameRecordScalarWhereWithAggregatesInput[]
    NOT?: ItoGameRecordScalarWhereWithAggregatesInput | ItoGameRecordScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"ItoGameRecord"> | number
    userId?: IntWithAggregatesFilter<"ItoGameRecord"> | number
    totalGames?: IntWithAggregatesFilter<"ItoGameRecord"> | number
    successCount?: IntWithAggregatesFilter<"ItoGameRecord"> | number
  }

  export type FriendshipWhereInput = {
    AND?: FriendshipWhereInput | FriendshipWhereInput[]
    OR?: FriendshipWhereInput[]
    NOT?: FriendshipWhereInput | FriendshipWhereInput[]
    id?: IntFilter<"Friendship"> | number
    applicantId?: IntFilter<"Friendship"> | number
    approverId?: IntFilter<"Friendship"> | number
    status?: StringFilter<"Friendship"> | string
    createdAt?: DateTimeFilter<"Friendship"> | Date | string
    applicant?: XOR<UserScalarRelationFilter, UserWhereInput>
    approver?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type FriendshipOrderByWithRelationInput = {
    id?: SortOrder
    applicantId?: SortOrder
    approverId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    applicant?: UserOrderByWithRelationInput
    approver?: UserOrderByWithRelationInput
  }

  export type FriendshipWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    applicantId_approverId?: FriendshipApplicantIdApproverIdCompoundUniqueInput
    AND?: FriendshipWhereInput | FriendshipWhereInput[]
    OR?: FriendshipWhereInput[]
    NOT?: FriendshipWhereInput | FriendshipWhereInput[]
    applicantId?: IntFilter<"Friendship"> | number
    approverId?: IntFilter<"Friendship"> | number
    status?: StringFilter<"Friendship"> | string
    createdAt?: DateTimeFilter<"Friendship"> | Date | string
    applicant?: XOR<UserScalarRelationFilter, UserWhereInput>
    approver?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "applicantId_approverId">

  export type FriendshipOrderByWithAggregationInput = {
    id?: SortOrder
    applicantId?: SortOrder
    approverId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    _count?: FriendshipCountOrderByAggregateInput
    _avg?: FriendshipAvgOrderByAggregateInput
    _max?: FriendshipMaxOrderByAggregateInput
    _min?: FriendshipMinOrderByAggregateInput
    _sum?: FriendshipSumOrderByAggregateInput
  }

  export type FriendshipScalarWhereWithAggregatesInput = {
    AND?: FriendshipScalarWhereWithAggregatesInput | FriendshipScalarWhereWithAggregatesInput[]
    OR?: FriendshipScalarWhereWithAggregatesInput[]
    NOT?: FriendshipScalarWhereWithAggregatesInput | FriendshipScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Friendship"> | number
    applicantId?: IntWithAggregatesFilter<"Friendship"> | number
    approverId?: IntWithAggregatesFilter<"Friendship"> | number
    status?: StringWithAggregatesFilter<"Friendship"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Friendship"> | Date | string
  }

  export type BlockWhereInput = {
    AND?: BlockWhereInput | BlockWhereInput[]
    OR?: BlockWhereInput[]
    NOT?: BlockWhereInput | BlockWhereInput[]
    id?: IntFilter<"Block"> | number
    blockerId?: IntFilter<"Block"> | number
    blockedId?: IntFilter<"Block"> | number
    createdAt?: DateTimeFilter<"Block"> | Date | string
    blocker?: XOR<UserScalarRelationFilter, UserWhereInput>
    blocked?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type BlockOrderByWithRelationInput = {
    id?: SortOrder
    blockerId?: SortOrder
    blockedId?: SortOrder
    createdAt?: SortOrder
    blocker?: UserOrderByWithRelationInput
    blocked?: UserOrderByWithRelationInput
  }

  export type BlockWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    blockerId_blockedId?: BlockBlockerIdBlockedIdCompoundUniqueInput
    AND?: BlockWhereInput | BlockWhereInput[]
    OR?: BlockWhereInput[]
    NOT?: BlockWhereInput | BlockWhereInput[]
    blockerId?: IntFilter<"Block"> | number
    blockedId?: IntFilter<"Block"> | number
    createdAt?: DateTimeFilter<"Block"> | Date | string
    blocker?: XOR<UserScalarRelationFilter, UserWhereInput>
    blocked?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "blockerId_blockedId">

  export type BlockOrderByWithAggregationInput = {
    id?: SortOrder
    blockerId?: SortOrder
    blockedId?: SortOrder
    createdAt?: SortOrder
    _count?: BlockCountOrderByAggregateInput
    _avg?: BlockAvgOrderByAggregateInput
    _max?: BlockMaxOrderByAggregateInput
    _min?: BlockMinOrderByAggregateInput
    _sum?: BlockSumOrderByAggregateInput
  }

  export type BlockScalarWhereWithAggregatesInput = {
    AND?: BlockScalarWhereWithAggregatesInput | BlockScalarWhereWithAggregatesInput[]
    OR?: BlockScalarWhereWithAggregatesInput[]
    NOT?: BlockScalarWhereWithAggregatesInput | BlockScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Block"> | number
    blockerId?: IntWithAggregatesFilter<"Block"> | number
    blockedId?: IntWithAggregatesFilter<"Block"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Block"> | Date | string
  }

  export type DirectMessageWhereInput = {
    AND?: DirectMessageWhereInput | DirectMessageWhereInput[]
    OR?: DirectMessageWhereInput[]
    NOT?: DirectMessageWhereInput | DirectMessageWhereInput[]
    id?: IntFilter<"DirectMessage"> | number
    senderId?: IntFilter<"DirectMessage"> | number
    receiverId?: IntFilter<"DirectMessage"> | number
    content?: StringFilter<"DirectMessage"> | string
    createdAt?: DateTimeFilter<"DirectMessage"> | Date | string
    sender?: XOR<UserScalarRelationFilter, UserWhereInput>
    receiver?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type DirectMessageOrderByWithRelationInput = {
    id?: SortOrder
    senderId?: SortOrder
    receiverId?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    sender?: UserOrderByWithRelationInput
    receiver?: UserOrderByWithRelationInput
  }

  export type DirectMessageWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: DirectMessageWhereInput | DirectMessageWhereInput[]
    OR?: DirectMessageWhereInput[]
    NOT?: DirectMessageWhereInput | DirectMessageWhereInput[]
    senderId?: IntFilter<"DirectMessage"> | number
    receiverId?: IntFilter<"DirectMessage"> | number
    content?: StringFilter<"DirectMessage"> | string
    createdAt?: DateTimeFilter<"DirectMessage"> | Date | string
    sender?: XOR<UserScalarRelationFilter, UserWhereInput>
    receiver?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type DirectMessageOrderByWithAggregationInput = {
    id?: SortOrder
    senderId?: SortOrder
    receiverId?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    _count?: DirectMessageCountOrderByAggregateInput
    _avg?: DirectMessageAvgOrderByAggregateInput
    _max?: DirectMessageMaxOrderByAggregateInput
    _min?: DirectMessageMinOrderByAggregateInput
    _sum?: DirectMessageSumOrderByAggregateInput
  }

  export type DirectMessageScalarWhereWithAggregatesInput = {
    AND?: DirectMessageScalarWhereWithAggregatesInput | DirectMessageScalarWhereWithAggregatesInput[]
    OR?: DirectMessageScalarWhereWithAggregatesInput[]
    NOT?: DirectMessageScalarWhereWithAggregatesInput | DirectMessageScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"DirectMessage"> | number
    senderId?: IntWithAggregatesFilter<"DirectMessage"> | number
    receiverId?: IntWithAggregatesFilter<"DirectMessage"> | number
    content?: StringWithAggregatesFilter<"DirectMessage"> | string
    createdAt?: DateTimeWithAggregatesFilter<"DirectMessage"> | Date | string
  }

  export type UserCreateInput = {
    email: string
    password: string
    username: string
    profileImage?: string | null
    bio?: string | null
    gameRecord?: ItoGameRecordCreateNestedOneWithoutUserInput
    sentMessages?: DirectMessageCreateNestedManyWithoutSenderInput
    receivedMessages?: DirectMessageCreateNestedManyWithoutReceiverInput
    appliedFriendships?: FriendshipCreateNestedManyWithoutApplicantInput
    receivedFriendships?: FriendshipCreateNestedManyWithoutApproverInput
    blocksMade?: BlockCreateNestedManyWithoutBlockerInput
    blocksReceived?: BlockCreateNestedManyWithoutBlockedInput
  }

  export type UserUncheckedCreateInput = {
    id?: number
    email: string
    password: string
    username: string
    profileImage?: string | null
    bio?: string | null
    gameRecord?: ItoGameRecordUncheckedCreateNestedOneWithoutUserInput
    sentMessages?: DirectMessageUncheckedCreateNestedManyWithoutSenderInput
    receivedMessages?: DirectMessageUncheckedCreateNestedManyWithoutReceiverInput
    appliedFriendships?: FriendshipUncheckedCreateNestedManyWithoutApplicantInput
    receivedFriendships?: FriendshipUncheckedCreateNestedManyWithoutApproverInput
    blocksMade?: BlockUncheckedCreateNestedManyWithoutBlockerInput
    blocksReceived?: BlockUncheckedCreateNestedManyWithoutBlockedInput
  }

  export type UserUpdateInput = {
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    profileImage?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    gameRecord?: ItoGameRecordUpdateOneWithoutUserNestedInput
    sentMessages?: DirectMessageUpdateManyWithoutSenderNestedInput
    receivedMessages?: DirectMessageUpdateManyWithoutReceiverNestedInput
    appliedFriendships?: FriendshipUpdateManyWithoutApplicantNestedInput
    receivedFriendships?: FriendshipUpdateManyWithoutApproverNestedInput
    blocksMade?: BlockUpdateManyWithoutBlockerNestedInput
    blocksReceived?: BlockUpdateManyWithoutBlockedNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    profileImage?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    gameRecord?: ItoGameRecordUncheckedUpdateOneWithoutUserNestedInput
    sentMessages?: DirectMessageUncheckedUpdateManyWithoutSenderNestedInput
    receivedMessages?: DirectMessageUncheckedUpdateManyWithoutReceiverNestedInput
    appliedFriendships?: FriendshipUncheckedUpdateManyWithoutApplicantNestedInput
    receivedFriendships?: FriendshipUncheckedUpdateManyWithoutApproverNestedInput
    blocksMade?: BlockUncheckedUpdateManyWithoutBlockerNestedInput
    blocksReceived?: BlockUncheckedUpdateManyWithoutBlockedNestedInput
  }

  export type UserCreateManyInput = {
    id?: number
    email: string
    password: string
    username: string
    profileImage?: string | null
    bio?: string | null
  }

  export type UserUpdateManyMutationInput = {
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    profileImage?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    profileImage?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ItoGameRecordCreateInput = {
    totalGames?: number
    successCount?: number
    user: UserCreateNestedOneWithoutGameRecordInput
  }

  export type ItoGameRecordUncheckedCreateInput = {
    id?: number
    userId: number
    totalGames?: number
    successCount?: number
  }

  export type ItoGameRecordUpdateInput = {
    totalGames?: IntFieldUpdateOperationsInput | number
    successCount?: IntFieldUpdateOperationsInput | number
    user?: UserUpdateOneRequiredWithoutGameRecordNestedInput
  }

  export type ItoGameRecordUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    totalGames?: IntFieldUpdateOperationsInput | number
    successCount?: IntFieldUpdateOperationsInput | number
  }

  export type ItoGameRecordCreateManyInput = {
    id?: number
    userId: number
    totalGames?: number
    successCount?: number
  }

  export type ItoGameRecordUpdateManyMutationInput = {
    totalGames?: IntFieldUpdateOperationsInput | number
    successCount?: IntFieldUpdateOperationsInput | number
  }

  export type ItoGameRecordUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    totalGames?: IntFieldUpdateOperationsInput | number
    successCount?: IntFieldUpdateOperationsInput | number
  }

  export type FriendshipCreateInput = {
    status?: string
    createdAt?: Date | string
    applicant: UserCreateNestedOneWithoutAppliedFriendshipsInput
    approver: UserCreateNestedOneWithoutReceivedFriendshipsInput
  }

  export type FriendshipUncheckedCreateInput = {
    id?: number
    applicantId: number
    approverId: number
    status?: string
    createdAt?: Date | string
  }

  export type FriendshipUpdateInput = {
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    applicant?: UserUpdateOneRequiredWithoutAppliedFriendshipsNestedInput
    approver?: UserUpdateOneRequiredWithoutReceivedFriendshipsNestedInput
  }

  export type FriendshipUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    applicantId?: IntFieldUpdateOperationsInput | number
    approverId?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FriendshipCreateManyInput = {
    id?: number
    applicantId: number
    approverId: number
    status?: string
    createdAt?: Date | string
  }

  export type FriendshipUpdateManyMutationInput = {
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FriendshipUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    applicantId?: IntFieldUpdateOperationsInput | number
    approverId?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlockCreateInput = {
    createdAt?: Date | string
    blocker: UserCreateNestedOneWithoutBlocksMadeInput
    blocked: UserCreateNestedOneWithoutBlocksReceivedInput
  }

  export type BlockUncheckedCreateInput = {
    id?: number
    blockerId: number
    blockedId: number
    createdAt?: Date | string
  }

  export type BlockUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    blocker?: UserUpdateOneRequiredWithoutBlocksMadeNestedInput
    blocked?: UserUpdateOneRequiredWithoutBlocksReceivedNestedInput
  }

  export type BlockUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    blockerId?: IntFieldUpdateOperationsInput | number
    blockedId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlockCreateManyInput = {
    id?: number
    blockerId: number
    blockedId: number
    createdAt?: Date | string
  }

  export type BlockUpdateManyMutationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlockUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    blockerId?: IntFieldUpdateOperationsInput | number
    blockedId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DirectMessageCreateInput = {
    content: string
    createdAt?: Date | string
    sender: UserCreateNestedOneWithoutSentMessagesInput
    receiver: UserCreateNestedOneWithoutReceivedMessagesInput
  }

  export type DirectMessageUncheckedCreateInput = {
    id?: number
    senderId: number
    receiverId: number
    content: string
    createdAt?: Date | string
  }

  export type DirectMessageUpdateInput = {
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sender?: UserUpdateOneRequiredWithoutSentMessagesNestedInput
    receiver?: UserUpdateOneRequiredWithoutReceivedMessagesNestedInput
  }

  export type DirectMessageUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    senderId?: IntFieldUpdateOperationsInput | number
    receiverId?: IntFieldUpdateOperationsInput | number
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DirectMessageCreateManyInput = {
    id?: number
    senderId: number
    receiverId: number
    content: string
    createdAt?: Date | string
  }

  export type DirectMessageUpdateManyMutationInput = {
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DirectMessageUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    senderId?: IntFieldUpdateOperationsInput | number
    receiverId?: IntFieldUpdateOperationsInput | number
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type ItoGameRecordNullableScalarRelationFilter = {
    is?: ItoGameRecordWhereInput | null
    isNot?: ItoGameRecordWhereInput | null
  }

  export type DirectMessageListRelationFilter = {
    every?: DirectMessageWhereInput
    some?: DirectMessageWhereInput
    none?: DirectMessageWhereInput
  }

  export type FriendshipListRelationFilter = {
    every?: FriendshipWhereInput
    some?: FriendshipWhereInput
    none?: FriendshipWhereInput
  }

  export type BlockListRelationFilter = {
    every?: BlockWhereInput
    some?: BlockWhereInput
    none?: BlockWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type DirectMessageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type FriendshipOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type BlockOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    username?: SortOrder
    profileImage?: SortOrder
    bio?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    username?: SortOrder
    profileImage?: SortOrder
    bio?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    username?: SortOrder
    profileImage?: SortOrder
    bio?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type ItoGameRecordCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    totalGames?: SortOrder
    successCount?: SortOrder
  }

  export type ItoGameRecordAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    totalGames?: SortOrder
    successCount?: SortOrder
  }

  export type ItoGameRecordMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    totalGames?: SortOrder
    successCount?: SortOrder
  }

  export type ItoGameRecordMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    totalGames?: SortOrder
    successCount?: SortOrder
  }

  export type ItoGameRecordSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    totalGames?: SortOrder
    successCount?: SortOrder
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type FriendshipApplicantIdApproverIdCompoundUniqueInput = {
    applicantId: number
    approverId: number
  }

  export type FriendshipCountOrderByAggregateInput = {
    id?: SortOrder
    applicantId?: SortOrder
    approverId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
  }

  export type FriendshipAvgOrderByAggregateInput = {
    id?: SortOrder
    applicantId?: SortOrder
    approverId?: SortOrder
  }

  export type FriendshipMaxOrderByAggregateInput = {
    id?: SortOrder
    applicantId?: SortOrder
    approverId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
  }

  export type FriendshipMinOrderByAggregateInput = {
    id?: SortOrder
    applicantId?: SortOrder
    approverId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
  }

  export type FriendshipSumOrderByAggregateInput = {
    id?: SortOrder
    applicantId?: SortOrder
    approverId?: SortOrder
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type BlockBlockerIdBlockedIdCompoundUniqueInput = {
    blockerId: number
    blockedId: number
  }

  export type BlockCountOrderByAggregateInput = {
    id?: SortOrder
    blockerId?: SortOrder
    blockedId?: SortOrder
    createdAt?: SortOrder
  }

  export type BlockAvgOrderByAggregateInput = {
    id?: SortOrder
    blockerId?: SortOrder
    blockedId?: SortOrder
  }

  export type BlockMaxOrderByAggregateInput = {
    id?: SortOrder
    blockerId?: SortOrder
    blockedId?: SortOrder
    createdAt?: SortOrder
  }

  export type BlockMinOrderByAggregateInput = {
    id?: SortOrder
    blockerId?: SortOrder
    blockedId?: SortOrder
    createdAt?: SortOrder
  }

  export type BlockSumOrderByAggregateInput = {
    id?: SortOrder
    blockerId?: SortOrder
    blockedId?: SortOrder
  }

  export type DirectMessageCountOrderByAggregateInput = {
    id?: SortOrder
    senderId?: SortOrder
    receiverId?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
  }

  export type DirectMessageAvgOrderByAggregateInput = {
    id?: SortOrder
    senderId?: SortOrder
    receiverId?: SortOrder
  }

  export type DirectMessageMaxOrderByAggregateInput = {
    id?: SortOrder
    senderId?: SortOrder
    receiverId?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
  }

  export type DirectMessageMinOrderByAggregateInput = {
    id?: SortOrder
    senderId?: SortOrder
    receiverId?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
  }

  export type DirectMessageSumOrderByAggregateInput = {
    id?: SortOrder
    senderId?: SortOrder
    receiverId?: SortOrder
  }

  export type ItoGameRecordCreateNestedOneWithoutUserInput = {
    create?: XOR<ItoGameRecordCreateWithoutUserInput, ItoGameRecordUncheckedCreateWithoutUserInput>
    connectOrCreate?: ItoGameRecordCreateOrConnectWithoutUserInput
    connect?: ItoGameRecordWhereUniqueInput
  }

  export type DirectMessageCreateNestedManyWithoutSenderInput = {
    create?: XOR<DirectMessageCreateWithoutSenderInput, DirectMessageUncheckedCreateWithoutSenderInput> | DirectMessageCreateWithoutSenderInput[] | DirectMessageUncheckedCreateWithoutSenderInput[]
    connectOrCreate?: DirectMessageCreateOrConnectWithoutSenderInput | DirectMessageCreateOrConnectWithoutSenderInput[]
    createMany?: DirectMessageCreateManySenderInputEnvelope
    connect?: DirectMessageWhereUniqueInput | DirectMessageWhereUniqueInput[]
  }

  export type DirectMessageCreateNestedManyWithoutReceiverInput = {
    create?: XOR<DirectMessageCreateWithoutReceiverInput, DirectMessageUncheckedCreateWithoutReceiverInput> | DirectMessageCreateWithoutReceiverInput[] | DirectMessageUncheckedCreateWithoutReceiverInput[]
    connectOrCreate?: DirectMessageCreateOrConnectWithoutReceiverInput | DirectMessageCreateOrConnectWithoutReceiverInput[]
    createMany?: DirectMessageCreateManyReceiverInputEnvelope
    connect?: DirectMessageWhereUniqueInput | DirectMessageWhereUniqueInput[]
  }

  export type FriendshipCreateNestedManyWithoutApplicantInput = {
    create?: XOR<FriendshipCreateWithoutApplicantInput, FriendshipUncheckedCreateWithoutApplicantInput> | FriendshipCreateWithoutApplicantInput[] | FriendshipUncheckedCreateWithoutApplicantInput[]
    connectOrCreate?: FriendshipCreateOrConnectWithoutApplicantInput | FriendshipCreateOrConnectWithoutApplicantInput[]
    createMany?: FriendshipCreateManyApplicantInputEnvelope
    connect?: FriendshipWhereUniqueInput | FriendshipWhereUniqueInput[]
  }

  export type FriendshipCreateNestedManyWithoutApproverInput = {
    create?: XOR<FriendshipCreateWithoutApproverInput, FriendshipUncheckedCreateWithoutApproverInput> | FriendshipCreateWithoutApproverInput[] | FriendshipUncheckedCreateWithoutApproverInput[]
    connectOrCreate?: FriendshipCreateOrConnectWithoutApproverInput | FriendshipCreateOrConnectWithoutApproverInput[]
    createMany?: FriendshipCreateManyApproverInputEnvelope
    connect?: FriendshipWhereUniqueInput | FriendshipWhereUniqueInput[]
  }

  export type BlockCreateNestedManyWithoutBlockerInput = {
    create?: XOR<BlockCreateWithoutBlockerInput, BlockUncheckedCreateWithoutBlockerInput> | BlockCreateWithoutBlockerInput[] | BlockUncheckedCreateWithoutBlockerInput[]
    connectOrCreate?: BlockCreateOrConnectWithoutBlockerInput | BlockCreateOrConnectWithoutBlockerInput[]
    createMany?: BlockCreateManyBlockerInputEnvelope
    connect?: BlockWhereUniqueInput | BlockWhereUniqueInput[]
  }

  export type BlockCreateNestedManyWithoutBlockedInput = {
    create?: XOR<BlockCreateWithoutBlockedInput, BlockUncheckedCreateWithoutBlockedInput> | BlockCreateWithoutBlockedInput[] | BlockUncheckedCreateWithoutBlockedInput[]
    connectOrCreate?: BlockCreateOrConnectWithoutBlockedInput | BlockCreateOrConnectWithoutBlockedInput[]
    createMany?: BlockCreateManyBlockedInputEnvelope
    connect?: BlockWhereUniqueInput | BlockWhereUniqueInput[]
  }

  export type ItoGameRecordUncheckedCreateNestedOneWithoutUserInput = {
    create?: XOR<ItoGameRecordCreateWithoutUserInput, ItoGameRecordUncheckedCreateWithoutUserInput>
    connectOrCreate?: ItoGameRecordCreateOrConnectWithoutUserInput
    connect?: ItoGameRecordWhereUniqueInput
  }

  export type DirectMessageUncheckedCreateNestedManyWithoutSenderInput = {
    create?: XOR<DirectMessageCreateWithoutSenderInput, DirectMessageUncheckedCreateWithoutSenderInput> | DirectMessageCreateWithoutSenderInput[] | DirectMessageUncheckedCreateWithoutSenderInput[]
    connectOrCreate?: DirectMessageCreateOrConnectWithoutSenderInput | DirectMessageCreateOrConnectWithoutSenderInput[]
    createMany?: DirectMessageCreateManySenderInputEnvelope
    connect?: DirectMessageWhereUniqueInput | DirectMessageWhereUniqueInput[]
  }

  export type DirectMessageUncheckedCreateNestedManyWithoutReceiverInput = {
    create?: XOR<DirectMessageCreateWithoutReceiverInput, DirectMessageUncheckedCreateWithoutReceiverInput> | DirectMessageCreateWithoutReceiverInput[] | DirectMessageUncheckedCreateWithoutReceiverInput[]
    connectOrCreate?: DirectMessageCreateOrConnectWithoutReceiverInput | DirectMessageCreateOrConnectWithoutReceiverInput[]
    createMany?: DirectMessageCreateManyReceiverInputEnvelope
    connect?: DirectMessageWhereUniqueInput | DirectMessageWhereUniqueInput[]
  }

  export type FriendshipUncheckedCreateNestedManyWithoutApplicantInput = {
    create?: XOR<FriendshipCreateWithoutApplicantInput, FriendshipUncheckedCreateWithoutApplicantInput> | FriendshipCreateWithoutApplicantInput[] | FriendshipUncheckedCreateWithoutApplicantInput[]
    connectOrCreate?: FriendshipCreateOrConnectWithoutApplicantInput | FriendshipCreateOrConnectWithoutApplicantInput[]
    createMany?: FriendshipCreateManyApplicantInputEnvelope
    connect?: FriendshipWhereUniqueInput | FriendshipWhereUniqueInput[]
  }

  export type FriendshipUncheckedCreateNestedManyWithoutApproverInput = {
    create?: XOR<FriendshipCreateWithoutApproverInput, FriendshipUncheckedCreateWithoutApproverInput> | FriendshipCreateWithoutApproverInput[] | FriendshipUncheckedCreateWithoutApproverInput[]
    connectOrCreate?: FriendshipCreateOrConnectWithoutApproverInput | FriendshipCreateOrConnectWithoutApproverInput[]
    createMany?: FriendshipCreateManyApproverInputEnvelope
    connect?: FriendshipWhereUniqueInput | FriendshipWhereUniqueInput[]
  }

  export type BlockUncheckedCreateNestedManyWithoutBlockerInput = {
    create?: XOR<BlockCreateWithoutBlockerInput, BlockUncheckedCreateWithoutBlockerInput> | BlockCreateWithoutBlockerInput[] | BlockUncheckedCreateWithoutBlockerInput[]
    connectOrCreate?: BlockCreateOrConnectWithoutBlockerInput | BlockCreateOrConnectWithoutBlockerInput[]
    createMany?: BlockCreateManyBlockerInputEnvelope
    connect?: BlockWhereUniqueInput | BlockWhereUniqueInput[]
  }

  export type BlockUncheckedCreateNestedManyWithoutBlockedInput = {
    create?: XOR<BlockCreateWithoutBlockedInput, BlockUncheckedCreateWithoutBlockedInput> | BlockCreateWithoutBlockedInput[] | BlockUncheckedCreateWithoutBlockedInput[]
    connectOrCreate?: BlockCreateOrConnectWithoutBlockedInput | BlockCreateOrConnectWithoutBlockedInput[]
    createMany?: BlockCreateManyBlockedInputEnvelope
    connect?: BlockWhereUniqueInput | BlockWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type ItoGameRecordUpdateOneWithoutUserNestedInput = {
    create?: XOR<ItoGameRecordCreateWithoutUserInput, ItoGameRecordUncheckedCreateWithoutUserInput>
    connectOrCreate?: ItoGameRecordCreateOrConnectWithoutUserInput
    upsert?: ItoGameRecordUpsertWithoutUserInput
    disconnect?: ItoGameRecordWhereInput | boolean
    delete?: ItoGameRecordWhereInput | boolean
    connect?: ItoGameRecordWhereUniqueInput
    update?: XOR<XOR<ItoGameRecordUpdateToOneWithWhereWithoutUserInput, ItoGameRecordUpdateWithoutUserInput>, ItoGameRecordUncheckedUpdateWithoutUserInput>
  }

  export type DirectMessageUpdateManyWithoutSenderNestedInput = {
    create?: XOR<DirectMessageCreateWithoutSenderInput, DirectMessageUncheckedCreateWithoutSenderInput> | DirectMessageCreateWithoutSenderInput[] | DirectMessageUncheckedCreateWithoutSenderInput[]
    connectOrCreate?: DirectMessageCreateOrConnectWithoutSenderInput | DirectMessageCreateOrConnectWithoutSenderInput[]
    upsert?: DirectMessageUpsertWithWhereUniqueWithoutSenderInput | DirectMessageUpsertWithWhereUniqueWithoutSenderInput[]
    createMany?: DirectMessageCreateManySenderInputEnvelope
    set?: DirectMessageWhereUniqueInput | DirectMessageWhereUniqueInput[]
    disconnect?: DirectMessageWhereUniqueInput | DirectMessageWhereUniqueInput[]
    delete?: DirectMessageWhereUniqueInput | DirectMessageWhereUniqueInput[]
    connect?: DirectMessageWhereUniqueInput | DirectMessageWhereUniqueInput[]
    update?: DirectMessageUpdateWithWhereUniqueWithoutSenderInput | DirectMessageUpdateWithWhereUniqueWithoutSenderInput[]
    updateMany?: DirectMessageUpdateManyWithWhereWithoutSenderInput | DirectMessageUpdateManyWithWhereWithoutSenderInput[]
    deleteMany?: DirectMessageScalarWhereInput | DirectMessageScalarWhereInput[]
  }

  export type DirectMessageUpdateManyWithoutReceiverNestedInput = {
    create?: XOR<DirectMessageCreateWithoutReceiverInput, DirectMessageUncheckedCreateWithoutReceiverInput> | DirectMessageCreateWithoutReceiverInput[] | DirectMessageUncheckedCreateWithoutReceiverInput[]
    connectOrCreate?: DirectMessageCreateOrConnectWithoutReceiverInput | DirectMessageCreateOrConnectWithoutReceiverInput[]
    upsert?: DirectMessageUpsertWithWhereUniqueWithoutReceiverInput | DirectMessageUpsertWithWhereUniqueWithoutReceiverInput[]
    createMany?: DirectMessageCreateManyReceiverInputEnvelope
    set?: DirectMessageWhereUniqueInput | DirectMessageWhereUniqueInput[]
    disconnect?: DirectMessageWhereUniqueInput | DirectMessageWhereUniqueInput[]
    delete?: DirectMessageWhereUniqueInput | DirectMessageWhereUniqueInput[]
    connect?: DirectMessageWhereUniqueInput | DirectMessageWhereUniqueInput[]
    update?: DirectMessageUpdateWithWhereUniqueWithoutReceiverInput | DirectMessageUpdateWithWhereUniqueWithoutReceiverInput[]
    updateMany?: DirectMessageUpdateManyWithWhereWithoutReceiverInput | DirectMessageUpdateManyWithWhereWithoutReceiverInput[]
    deleteMany?: DirectMessageScalarWhereInput | DirectMessageScalarWhereInput[]
  }

  export type FriendshipUpdateManyWithoutApplicantNestedInput = {
    create?: XOR<FriendshipCreateWithoutApplicantInput, FriendshipUncheckedCreateWithoutApplicantInput> | FriendshipCreateWithoutApplicantInput[] | FriendshipUncheckedCreateWithoutApplicantInput[]
    connectOrCreate?: FriendshipCreateOrConnectWithoutApplicantInput | FriendshipCreateOrConnectWithoutApplicantInput[]
    upsert?: FriendshipUpsertWithWhereUniqueWithoutApplicantInput | FriendshipUpsertWithWhereUniqueWithoutApplicantInput[]
    createMany?: FriendshipCreateManyApplicantInputEnvelope
    set?: FriendshipWhereUniqueInput | FriendshipWhereUniqueInput[]
    disconnect?: FriendshipWhereUniqueInput | FriendshipWhereUniqueInput[]
    delete?: FriendshipWhereUniqueInput | FriendshipWhereUniqueInput[]
    connect?: FriendshipWhereUniqueInput | FriendshipWhereUniqueInput[]
    update?: FriendshipUpdateWithWhereUniqueWithoutApplicantInput | FriendshipUpdateWithWhereUniqueWithoutApplicantInput[]
    updateMany?: FriendshipUpdateManyWithWhereWithoutApplicantInput | FriendshipUpdateManyWithWhereWithoutApplicantInput[]
    deleteMany?: FriendshipScalarWhereInput | FriendshipScalarWhereInput[]
  }

  export type FriendshipUpdateManyWithoutApproverNestedInput = {
    create?: XOR<FriendshipCreateWithoutApproverInput, FriendshipUncheckedCreateWithoutApproverInput> | FriendshipCreateWithoutApproverInput[] | FriendshipUncheckedCreateWithoutApproverInput[]
    connectOrCreate?: FriendshipCreateOrConnectWithoutApproverInput | FriendshipCreateOrConnectWithoutApproverInput[]
    upsert?: FriendshipUpsertWithWhereUniqueWithoutApproverInput | FriendshipUpsertWithWhereUniqueWithoutApproverInput[]
    createMany?: FriendshipCreateManyApproverInputEnvelope
    set?: FriendshipWhereUniqueInput | FriendshipWhereUniqueInput[]
    disconnect?: FriendshipWhereUniqueInput | FriendshipWhereUniqueInput[]
    delete?: FriendshipWhereUniqueInput | FriendshipWhereUniqueInput[]
    connect?: FriendshipWhereUniqueInput | FriendshipWhereUniqueInput[]
    update?: FriendshipUpdateWithWhereUniqueWithoutApproverInput | FriendshipUpdateWithWhereUniqueWithoutApproverInput[]
    updateMany?: FriendshipUpdateManyWithWhereWithoutApproverInput | FriendshipUpdateManyWithWhereWithoutApproverInput[]
    deleteMany?: FriendshipScalarWhereInput | FriendshipScalarWhereInput[]
  }

  export type BlockUpdateManyWithoutBlockerNestedInput = {
    create?: XOR<BlockCreateWithoutBlockerInput, BlockUncheckedCreateWithoutBlockerInput> | BlockCreateWithoutBlockerInput[] | BlockUncheckedCreateWithoutBlockerInput[]
    connectOrCreate?: BlockCreateOrConnectWithoutBlockerInput | BlockCreateOrConnectWithoutBlockerInput[]
    upsert?: BlockUpsertWithWhereUniqueWithoutBlockerInput | BlockUpsertWithWhereUniqueWithoutBlockerInput[]
    createMany?: BlockCreateManyBlockerInputEnvelope
    set?: BlockWhereUniqueInput | BlockWhereUniqueInput[]
    disconnect?: BlockWhereUniqueInput | BlockWhereUniqueInput[]
    delete?: BlockWhereUniqueInput | BlockWhereUniqueInput[]
    connect?: BlockWhereUniqueInput | BlockWhereUniqueInput[]
    update?: BlockUpdateWithWhereUniqueWithoutBlockerInput | BlockUpdateWithWhereUniqueWithoutBlockerInput[]
    updateMany?: BlockUpdateManyWithWhereWithoutBlockerInput | BlockUpdateManyWithWhereWithoutBlockerInput[]
    deleteMany?: BlockScalarWhereInput | BlockScalarWhereInput[]
  }

  export type BlockUpdateManyWithoutBlockedNestedInput = {
    create?: XOR<BlockCreateWithoutBlockedInput, BlockUncheckedCreateWithoutBlockedInput> | BlockCreateWithoutBlockedInput[] | BlockUncheckedCreateWithoutBlockedInput[]
    connectOrCreate?: BlockCreateOrConnectWithoutBlockedInput | BlockCreateOrConnectWithoutBlockedInput[]
    upsert?: BlockUpsertWithWhereUniqueWithoutBlockedInput | BlockUpsertWithWhereUniqueWithoutBlockedInput[]
    createMany?: BlockCreateManyBlockedInputEnvelope
    set?: BlockWhereUniqueInput | BlockWhereUniqueInput[]
    disconnect?: BlockWhereUniqueInput | BlockWhereUniqueInput[]
    delete?: BlockWhereUniqueInput | BlockWhereUniqueInput[]
    connect?: BlockWhereUniqueInput | BlockWhereUniqueInput[]
    update?: BlockUpdateWithWhereUniqueWithoutBlockedInput | BlockUpdateWithWhereUniqueWithoutBlockedInput[]
    updateMany?: BlockUpdateManyWithWhereWithoutBlockedInput | BlockUpdateManyWithWhereWithoutBlockedInput[]
    deleteMany?: BlockScalarWhereInput | BlockScalarWhereInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ItoGameRecordUncheckedUpdateOneWithoutUserNestedInput = {
    create?: XOR<ItoGameRecordCreateWithoutUserInput, ItoGameRecordUncheckedCreateWithoutUserInput>
    connectOrCreate?: ItoGameRecordCreateOrConnectWithoutUserInput
    upsert?: ItoGameRecordUpsertWithoutUserInput
    disconnect?: ItoGameRecordWhereInput | boolean
    delete?: ItoGameRecordWhereInput | boolean
    connect?: ItoGameRecordWhereUniqueInput
    update?: XOR<XOR<ItoGameRecordUpdateToOneWithWhereWithoutUserInput, ItoGameRecordUpdateWithoutUserInput>, ItoGameRecordUncheckedUpdateWithoutUserInput>
  }

  export type DirectMessageUncheckedUpdateManyWithoutSenderNestedInput = {
    create?: XOR<DirectMessageCreateWithoutSenderInput, DirectMessageUncheckedCreateWithoutSenderInput> | DirectMessageCreateWithoutSenderInput[] | DirectMessageUncheckedCreateWithoutSenderInput[]
    connectOrCreate?: DirectMessageCreateOrConnectWithoutSenderInput | DirectMessageCreateOrConnectWithoutSenderInput[]
    upsert?: DirectMessageUpsertWithWhereUniqueWithoutSenderInput | DirectMessageUpsertWithWhereUniqueWithoutSenderInput[]
    createMany?: DirectMessageCreateManySenderInputEnvelope
    set?: DirectMessageWhereUniqueInput | DirectMessageWhereUniqueInput[]
    disconnect?: DirectMessageWhereUniqueInput | DirectMessageWhereUniqueInput[]
    delete?: DirectMessageWhereUniqueInput | DirectMessageWhereUniqueInput[]
    connect?: DirectMessageWhereUniqueInput | DirectMessageWhereUniqueInput[]
    update?: DirectMessageUpdateWithWhereUniqueWithoutSenderInput | DirectMessageUpdateWithWhereUniqueWithoutSenderInput[]
    updateMany?: DirectMessageUpdateManyWithWhereWithoutSenderInput | DirectMessageUpdateManyWithWhereWithoutSenderInput[]
    deleteMany?: DirectMessageScalarWhereInput | DirectMessageScalarWhereInput[]
  }

  export type DirectMessageUncheckedUpdateManyWithoutReceiverNestedInput = {
    create?: XOR<DirectMessageCreateWithoutReceiverInput, DirectMessageUncheckedCreateWithoutReceiverInput> | DirectMessageCreateWithoutReceiverInput[] | DirectMessageUncheckedCreateWithoutReceiverInput[]
    connectOrCreate?: DirectMessageCreateOrConnectWithoutReceiverInput | DirectMessageCreateOrConnectWithoutReceiverInput[]
    upsert?: DirectMessageUpsertWithWhereUniqueWithoutReceiverInput | DirectMessageUpsertWithWhereUniqueWithoutReceiverInput[]
    createMany?: DirectMessageCreateManyReceiverInputEnvelope
    set?: DirectMessageWhereUniqueInput | DirectMessageWhereUniqueInput[]
    disconnect?: DirectMessageWhereUniqueInput | DirectMessageWhereUniqueInput[]
    delete?: DirectMessageWhereUniqueInput | DirectMessageWhereUniqueInput[]
    connect?: DirectMessageWhereUniqueInput | DirectMessageWhereUniqueInput[]
    update?: DirectMessageUpdateWithWhereUniqueWithoutReceiverInput | DirectMessageUpdateWithWhereUniqueWithoutReceiverInput[]
    updateMany?: DirectMessageUpdateManyWithWhereWithoutReceiverInput | DirectMessageUpdateManyWithWhereWithoutReceiverInput[]
    deleteMany?: DirectMessageScalarWhereInput | DirectMessageScalarWhereInput[]
  }

  export type FriendshipUncheckedUpdateManyWithoutApplicantNestedInput = {
    create?: XOR<FriendshipCreateWithoutApplicantInput, FriendshipUncheckedCreateWithoutApplicantInput> | FriendshipCreateWithoutApplicantInput[] | FriendshipUncheckedCreateWithoutApplicantInput[]
    connectOrCreate?: FriendshipCreateOrConnectWithoutApplicantInput | FriendshipCreateOrConnectWithoutApplicantInput[]
    upsert?: FriendshipUpsertWithWhereUniqueWithoutApplicantInput | FriendshipUpsertWithWhereUniqueWithoutApplicantInput[]
    createMany?: FriendshipCreateManyApplicantInputEnvelope
    set?: FriendshipWhereUniqueInput | FriendshipWhereUniqueInput[]
    disconnect?: FriendshipWhereUniqueInput | FriendshipWhereUniqueInput[]
    delete?: FriendshipWhereUniqueInput | FriendshipWhereUniqueInput[]
    connect?: FriendshipWhereUniqueInput | FriendshipWhereUniqueInput[]
    update?: FriendshipUpdateWithWhereUniqueWithoutApplicantInput | FriendshipUpdateWithWhereUniqueWithoutApplicantInput[]
    updateMany?: FriendshipUpdateManyWithWhereWithoutApplicantInput | FriendshipUpdateManyWithWhereWithoutApplicantInput[]
    deleteMany?: FriendshipScalarWhereInput | FriendshipScalarWhereInput[]
  }

  export type FriendshipUncheckedUpdateManyWithoutApproverNestedInput = {
    create?: XOR<FriendshipCreateWithoutApproverInput, FriendshipUncheckedCreateWithoutApproverInput> | FriendshipCreateWithoutApproverInput[] | FriendshipUncheckedCreateWithoutApproverInput[]
    connectOrCreate?: FriendshipCreateOrConnectWithoutApproverInput | FriendshipCreateOrConnectWithoutApproverInput[]
    upsert?: FriendshipUpsertWithWhereUniqueWithoutApproverInput | FriendshipUpsertWithWhereUniqueWithoutApproverInput[]
    createMany?: FriendshipCreateManyApproverInputEnvelope
    set?: FriendshipWhereUniqueInput | FriendshipWhereUniqueInput[]
    disconnect?: FriendshipWhereUniqueInput | FriendshipWhereUniqueInput[]
    delete?: FriendshipWhereUniqueInput | FriendshipWhereUniqueInput[]
    connect?: FriendshipWhereUniqueInput | FriendshipWhereUniqueInput[]
    update?: FriendshipUpdateWithWhereUniqueWithoutApproverInput | FriendshipUpdateWithWhereUniqueWithoutApproverInput[]
    updateMany?: FriendshipUpdateManyWithWhereWithoutApproverInput | FriendshipUpdateManyWithWhereWithoutApproverInput[]
    deleteMany?: FriendshipScalarWhereInput | FriendshipScalarWhereInput[]
  }

  export type BlockUncheckedUpdateManyWithoutBlockerNestedInput = {
    create?: XOR<BlockCreateWithoutBlockerInput, BlockUncheckedCreateWithoutBlockerInput> | BlockCreateWithoutBlockerInput[] | BlockUncheckedCreateWithoutBlockerInput[]
    connectOrCreate?: BlockCreateOrConnectWithoutBlockerInput | BlockCreateOrConnectWithoutBlockerInput[]
    upsert?: BlockUpsertWithWhereUniqueWithoutBlockerInput | BlockUpsertWithWhereUniqueWithoutBlockerInput[]
    createMany?: BlockCreateManyBlockerInputEnvelope
    set?: BlockWhereUniqueInput | BlockWhereUniqueInput[]
    disconnect?: BlockWhereUniqueInput | BlockWhereUniqueInput[]
    delete?: BlockWhereUniqueInput | BlockWhereUniqueInput[]
    connect?: BlockWhereUniqueInput | BlockWhereUniqueInput[]
    update?: BlockUpdateWithWhereUniqueWithoutBlockerInput | BlockUpdateWithWhereUniqueWithoutBlockerInput[]
    updateMany?: BlockUpdateManyWithWhereWithoutBlockerInput | BlockUpdateManyWithWhereWithoutBlockerInput[]
    deleteMany?: BlockScalarWhereInput | BlockScalarWhereInput[]
  }

  export type BlockUncheckedUpdateManyWithoutBlockedNestedInput = {
    create?: XOR<BlockCreateWithoutBlockedInput, BlockUncheckedCreateWithoutBlockedInput> | BlockCreateWithoutBlockedInput[] | BlockUncheckedCreateWithoutBlockedInput[]
    connectOrCreate?: BlockCreateOrConnectWithoutBlockedInput | BlockCreateOrConnectWithoutBlockedInput[]
    upsert?: BlockUpsertWithWhereUniqueWithoutBlockedInput | BlockUpsertWithWhereUniqueWithoutBlockedInput[]
    createMany?: BlockCreateManyBlockedInputEnvelope
    set?: BlockWhereUniqueInput | BlockWhereUniqueInput[]
    disconnect?: BlockWhereUniqueInput | BlockWhereUniqueInput[]
    delete?: BlockWhereUniqueInput | BlockWhereUniqueInput[]
    connect?: BlockWhereUniqueInput | BlockWhereUniqueInput[]
    update?: BlockUpdateWithWhereUniqueWithoutBlockedInput | BlockUpdateWithWhereUniqueWithoutBlockedInput[]
    updateMany?: BlockUpdateManyWithWhereWithoutBlockedInput | BlockUpdateManyWithWhereWithoutBlockedInput[]
    deleteMany?: BlockScalarWhereInput | BlockScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutGameRecordInput = {
    create?: XOR<UserCreateWithoutGameRecordInput, UserUncheckedCreateWithoutGameRecordInput>
    connectOrCreate?: UserCreateOrConnectWithoutGameRecordInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutGameRecordNestedInput = {
    create?: XOR<UserCreateWithoutGameRecordInput, UserUncheckedCreateWithoutGameRecordInput>
    connectOrCreate?: UserCreateOrConnectWithoutGameRecordInput
    upsert?: UserUpsertWithoutGameRecordInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutGameRecordInput, UserUpdateWithoutGameRecordInput>, UserUncheckedUpdateWithoutGameRecordInput>
  }

  export type UserCreateNestedOneWithoutAppliedFriendshipsInput = {
    create?: XOR<UserCreateWithoutAppliedFriendshipsInput, UserUncheckedCreateWithoutAppliedFriendshipsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAppliedFriendshipsInput
    connect?: UserWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutReceivedFriendshipsInput = {
    create?: XOR<UserCreateWithoutReceivedFriendshipsInput, UserUncheckedCreateWithoutReceivedFriendshipsInput>
    connectOrCreate?: UserCreateOrConnectWithoutReceivedFriendshipsInput
    connect?: UserWhereUniqueInput
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type UserUpdateOneRequiredWithoutAppliedFriendshipsNestedInput = {
    create?: XOR<UserCreateWithoutAppliedFriendshipsInput, UserUncheckedCreateWithoutAppliedFriendshipsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAppliedFriendshipsInput
    upsert?: UserUpsertWithoutAppliedFriendshipsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutAppliedFriendshipsInput, UserUpdateWithoutAppliedFriendshipsInput>, UserUncheckedUpdateWithoutAppliedFriendshipsInput>
  }

  export type UserUpdateOneRequiredWithoutReceivedFriendshipsNestedInput = {
    create?: XOR<UserCreateWithoutReceivedFriendshipsInput, UserUncheckedCreateWithoutReceivedFriendshipsInput>
    connectOrCreate?: UserCreateOrConnectWithoutReceivedFriendshipsInput
    upsert?: UserUpsertWithoutReceivedFriendshipsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutReceivedFriendshipsInput, UserUpdateWithoutReceivedFriendshipsInput>, UserUncheckedUpdateWithoutReceivedFriendshipsInput>
  }

  export type UserCreateNestedOneWithoutBlocksMadeInput = {
    create?: XOR<UserCreateWithoutBlocksMadeInput, UserUncheckedCreateWithoutBlocksMadeInput>
    connectOrCreate?: UserCreateOrConnectWithoutBlocksMadeInput
    connect?: UserWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutBlocksReceivedInput = {
    create?: XOR<UserCreateWithoutBlocksReceivedInput, UserUncheckedCreateWithoutBlocksReceivedInput>
    connectOrCreate?: UserCreateOrConnectWithoutBlocksReceivedInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutBlocksMadeNestedInput = {
    create?: XOR<UserCreateWithoutBlocksMadeInput, UserUncheckedCreateWithoutBlocksMadeInput>
    connectOrCreate?: UserCreateOrConnectWithoutBlocksMadeInput
    upsert?: UserUpsertWithoutBlocksMadeInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutBlocksMadeInput, UserUpdateWithoutBlocksMadeInput>, UserUncheckedUpdateWithoutBlocksMadeInput>
  }

  export type UserUpdateOneRequiredWithoutBlocksReceivedNestedInput = {
    create?: XOR<UserCreateWithoutBlocksReceivedInput, UserUncheckedCreateWithoutBlocksReceivedInput>
    connectOrCreate?: UserCreateOrConnectWithoutBlocksReceivedInput
    upsert?: UserUpsertWithoutBlocksReceivedInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutBlocksReceivedInput, UserUpdateWithoutBlocksReceivedInput>, UserUncheckedUpdateWithoutBlocksReceivedInput>
  }

  export type UserCreateNestedOneWithoutSentMessagesInput = {
    create?: XOR<UserCreateWithoutSentMessagesInput, UserUncheckedCreateWithoutSentMessagesInput>
    connectOrCreate?: UserCreateOrConnectWithoutSentMessagesInput
    connect?: UserWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutReceivedMessagesInput = {
    create?: XOR<UserCreateWithoutReceivedMessagesInput, UserUncheckedCreateWithoutReceivedMessagesInput>
    connectOrCreate?: UserCreateOrConnectWithoutReceivedMessagesInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutSentMessagesNestedInput = {
    create?: XOR<UserCreateWithoutSentMessagesInput, UserUncheckedCreateWithoutSentMessagesInput>
    connectOrCreate?: UserCreateOrConnectWithoutSentMessagesInput
    upsert?: UserUpsertWithoutSentMessagesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutSentMessagesInput, UserUpdateWithoutSentMessagesInput>, UserUncheckedUpdateWithoutSentMessagesInput>
  }

  export type UserUpdateOneRequiredWithoutReceivedMessagesNestedInput = {
    create?: XOR<UserCreateWithoutReceivedMessagesInput, UserUncheckedCreateWithoutReceivedMessagesInput>
    connectOrCreate?: UserCreateOrConnectWithoutReceivedMessagesInput
    upsert?: UserUpsertWithoutReceivedMessagesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutReceivedMessagesInput, UserUpdateWithoutReceivedMessagesInput>, UserUncheckedUpdateWithoutReceivedMessagesInput>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type ItoGameRecordCreateWithoutUserInput = {
    totalGames?: number
    successCount?: number
  }

  export type ItoGameRecordUncheckedCreateWithoutUserInput = {
    id?: number
    totalGames?: number
    successCount?: number
  }

  export type ItoGameRecordCreateOrConnectWithoutUserInput = {
    where: ItoGameRecordWhereUniqueInput
    create: XOR<ItoGameRecordCreateWithoutUserInput, ItoGameRecordUncheckedCreateWithoutUserInput>
  }

  export type DirectMessageCreateWithoutSenderInput = {
    content: string
    createdAt?: Date | string
    receiver: UserCreateNestedOneWithoutReceivedMessagesInput
  }

  export type DirectMessageUncheckedCreateWithoutSenderInput = {
    id?: number
    receiverId: number
    content: string
    createdAt?: Date | string
  }

  export type DirectMessageCreateOrConnectWithoutSenderInput = {
    where: DirectMessageWhereUniqueInput
    create: XOR<DirectMessageCreateWithoutSenderInput, DirectMessageUncheckedCreateWithoutSenderInput>
  }

  export type DirectMessageCreateManySenderInputEnvelope = {
    data: DirectMessageCreateManySenderInput | DirectMessageCreateManySenderInput[]
    skipDuplicates?: boolean
  }

  export type DirectMessageCreateWithoutReceiverInput = {
    content: string
    createdAt?: Date | string
    sender: UserCreateNestedOneWithoutSentMessagesInput
  }

  export type DirectMessageUncheckedCreateWithoutReceiverInput = {
    id?: number
    senderId: number
    content: string
    createdAt?: Date | string
  }

  export type DirectMessageCreateOrConnectWithoutReceiverInput = {
    where: DirectMessageWhereUniqueInput
    create: XOR<DirectMessageCreateWithoutReceiverInput, DirectMessageUncheckedCreateWithoutReceiverInput>
  }

  export type DirectMessageCreateManyReceiverInputEnvelope = {
    data: DirectMessageCreateManyReceiverInput | DirectMessageCreateManyReceiverInput[]
    skipDuplicates?: boolean
  }

  export type FriendshipCreateWithoutApplicantInput = {
    status?: string
    createdAt?: Date | string
    approver: UserCreateNestedOneWithoutReceivedFriendshipsInput
  }

  export type FriendshipUncheckedCreateWithoutApplicantInput = {
    id?: number
    approverId: number
    status?: string
    createdAt?: Date | string
  }

  export type FriendshipCreateOrConnectWithoutApplicantInput = {
    where: FriendshipWhereUniqueInput
    create: XOR<FriendshipCreateWithoutApplicantInput, FriendshipUncheckedCreateWithoutApplicantInput>
  }

  export type FriendshipCreateManyApplicantInputEnvelope = {
    data: FriendshipCreateManyApplicantInput | FriendshipCreateManyApplicantInput[]
    skipDuplicates?: boolean
  }

  export type FriendshipCreateWithoutApproverInput = {
    status?: string
    createdAt?: Date | string
    applicant: UserCreateNestedOneWithoutAppliedFriendshipsInput
  }

  export type FriendshipUncheckedCreateWithoutApproverInput = {
    id?: number
    applicantId: number
    status?: string
    createdAt?: Date | string
  }

  export type FriendshipCreateOrConnectWithoutApproverInput = {
    where: FriendshipWhereUniqueInput
    create: XOR<FriendshipCreateWithoutApproverInput, FriendshipUncheckedCreateWithoutApproverInput>
  }

  export type FriendshipCreateManyApproverInputEnvelope = {
    data: FriendshipCreateManyApproverInput | FriendshipCreateManyApproverInput[]
    skipDuplicates?: boolean
  }

  export type BlockCreateWithoutBlockerInput = {
    createdAt?: Date | string
    blocked: UserCreateNestedOneWithoutBlocksReceivedInput
  }

  export type BlockUncheckedCreateWithoutBlockerInput = {
    id?: number
    blockedId: number
    createdAt?: Date | string
  }

  export type BlockCreateOrConnectWithoutBlockerInput = {
    where: BlockWhereUniqueInput
    create: XOR<BlockCreateWithoutBlockerInput, BlockUncheckedCreateWithoutBlockerInput>
  }

  export type BlockCreateManyBlockerInputEnvelope = {
    data: BlockCreateManyBlockerInput | BlockCreateManyBlockerInput[]
    skipDuplicates?: boolean
  }

  export type BlockCreateWithoutBlockedInput = {
    createdAt?: Date | string
    blocker: UserCreateNestedOneWithoutBlocksMadeInput
  }

  export type BlockUncheckedCreateWithoutBlockedInput = {
    id?: number
    blockerId: number
    createdAt?: Date | string
  }

  export type BlockCreateOrConnectWithoutBlockedInput = {
    where: BlockWhereUniqueInput
    create: XOR<BlockCreateWithoutBlockedInput, BlockUncheckedCreateWithoutBlockedInput>
  }

  export type BlockCreateManyBlockedInputEnvelope = {
    data: BlockCreateManyBlockedInput | BlockCreateManyBlockedInput[]
    skipDuplicates?: boolean
  }

  export type ItoGameRecordUpsertWithoutUserInput = {
    update: XOR<ItoGameRecordUpdateWithoutUserInput, ItoGameRecordUncheckedUpdateWithoutUserInput>
    create: XOR<ItoGameRecordCreateWithoutUserInput, ItoGameRecordUncheckedCreateWithoutUserInput>
    where?: ItoGameRecordWhereInput
  }

  export type ItoGameRecordUpdateToOneWithWhereWithoutUserInput = {
    where?: ItoGameRecordWhereInput
    data: XOR<ItoGameRecordUpdateWithoutUserInput, ItoGameRecordUncheckedUpdateWithoutUserInput>
  }

  export type ItoGameRecordUpdateWithoutUserInput = {
    totalGames?: IntFieldUpdateOperationsInput | number
    successCount?: IntFieldUpdateOperationsInput | number
  }

  export type ItoGameRecordUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    totalGames?: IntFieldUpdateOperationsInput | number
    successCount?: IntFieldUpdateOperationsInput | number
  }

  export type DirectMessageUpsertWithWhereUniqueWithoutSenderInput = {
    where: DirectMessageWhereUniqueInput
    update: XOR<DirectMessageUpdateWithoutSenderInput, DirectMessageUncheckedUpdateWithoutSenderInput>
    create: XOR<DirectMessageCreateWithoutSenderInput, DirectMessageUncheckedCreateWithoutSenderInput>
  }

  export type DirectMessageUpdateWithWhereUniqueWithoutSenderInput = {
    where: DirectMessageWhereUniqueInput
    data: XOR<DirectMessageUpdateWithoutSenderInput, DirectMessageUncheckedUpdateWithoutSenderInput>
  }

  export type DirectMessageUpdateManyWithWhereWithoutSenderInput = {
    where: DirectMessageScalarWhereInput
    data: XOR<DirectMessageUpdateManyMutationInput, DirectMessageUncheckedUpdateManyWithoutSenderInput>
  }

  export type DirectMessageScalarWhereInput = {
    AND?: DirectMessageScalarWhereInput | DirectMessageScalarWhereInput[]
    OR?: DirectMessageScalarWhereInput[]
    NOT?: DirectMessageScalarWhereInput | DirectMessageScalarWhereInput[]
    id?: IntFilter<"DirectMessage"> | number
    senderId?: IntFilter<"DirectMessage"> | number
    receiverId?: IntFilter<"DirectMessage"> | number
    content?: StringFilter<"DirectMessage"> | string
    createdAt?: DateTimeFilter<"DirectMessage"> | Date | string
  }

  export type DirectMessageUpsertWithWhereUniqueWithoutReceiverInput = {
    where: DirectMessageWhereUniqueInput
    update: XOR<DirectMessageUpdateWithoutReceiverInput, DirectMessageUncheckedUpdateWithoutReceiverInput>
    create: XOR<DirectMessageCreateWithoutReceiverInput, DirectMessageUncheckedCreateWithoutReceiverInput>
  }

  export type DirectMessageUpdateWithWhereUniqueWithoutReceiverInput = {
    where: DirectMessageWhereUniqueInput
    data: XOR<DirectMessageUpdateWithoutReceiverInput, DirectMessageUncheckedUpdateWithoutReceiverInput>
  }

  export type DirectMessageUpdateManyWithWhereWithoutReceiverInput = {
    where: DirectMessageScalarWhereInput
    data: XOR<DirectMessageUpdateManyMutationInput, DirectMessageUncheckedUpdateManyWithoutReceiverInput>
  }

  export type FriendshipUpsertWithWhereUniqueWithoutApplicantInput = {
    where: FriendshipWhereUniqueInput
    update: XOR<FriendshipUpdateWithoutApplicantInput, FriendshipUncheckedUpdateWithoutApplicantInput>
    create: XOR<FriendshipCreateWithoutApplicantInput, FriendshipUncheckedCreateWithoutApplicantInput>
  }

  export type FriendshipUpdateWithWhereUniqueWithoutApplicantInput = {
    where: FriendshipWhereUniqueInput
    data: XOR<FriendshipUpdateWithoutApplicantInput, FriendshipUncheckedUpdateWithoutApplicantInput>
  }

  export type FriendshipUpdateManyWithWhereWithoutApplicantInput = {
    where: FriendshipScalarWhereInput
    data: XOR<FriendshipUpdateManyMutationInput, FriendshipUncheckedUpdateManyWithoutApplicantInput>
  }

  export type FriendshipScalarWhereInput = {
    AND?: FriendshipScalarWhereInput | FriendshipScalarWhereInput[]
    OR?: FriendshipScalarWhereInput[]
    NOT?: FriendshipScalarWhereInput | FriendshipScalarWhereInput[]
    id?: IntFilter<"Friendship"> | number
    applicantId?: IntFilter<"Friendship"> | number
    approverId?: IntFilter<"Friendship"> | number
    status?: StringFilter<"Friendship"> | string
    createdAt?: DateTimeFilter<"Friendship"> | Date | string
  }

  export type FriendshipUpsertWithWhereUniqueWithoutApproverInput = {
    where: FriendshipWhereUniqueInput
    update: XOR<FriendshipUpdateWithoutApproverInput, FriendshipUncheckedUpdateWithoutApproverInput>
    create: XOR<FriendshipCreateWithoutApproverInput, FriendshipUncheckedCreateWithoutApproverInput>
  }

  export type FriendshipUpdateWithWhereUniqueWithoutApproverInput = {
    where: FriendshipWhereUniqueInput
    data: XOR<FriendshipUpdateWithoutApproverInput, FriendshipUncheckedUpdateWithoutApproverInput>
  }

  export type FriendshipUpdateManyWithWhereWithoutApproverInput = {
    where: FriendshipScalarWhereInput
    data: XOR<FriendshipUpdateManyMutationInput, FriendshipUncheckedUpdateManyWithoutApproverInput>
  }

  export type BlockUpsertWithWhereUniqueWithoutBlockerInput = {
    where: BlockWhereUniqueInput
    update: XOR<BlockUpdateWithoutBlockerInput, BlockUncheckedUpdateWithoutBlockerInput>
    create: XOR<BlockCreateWithoutBlockerInput, BlockUncheckedCreateWithoutBlockerInput>
  }

  export type BlockUpdateWithWhereUniqueWithoutBlockerInput = {
    where: BlockWhereUniqueInput
    data: XOR<BlockUpdateWithoutBlockerInput, BlockUncheckedUpdateWithoutBlockerInput>
  }

  export type BlockUpdateManyWithWhereWithoutBlockerInput = {
    where: BlockScalarWhereInput
    data: XOR<BlockUpdateManyMutationInput, BlockUncheckedUpdateManyWithoutBlockerInput>
  }

  export type BlockScalarWhereInput = {
    AND?: BlockScalarWhereInput | BlockScalarWhereInput[]
    OR?: BlockScalarWhereInput[]
    NOT?: BlockScalarWhereInput | BlockScalarWhereInput[]
    id?: IntFilter<"Block"> | number
    blockerId?: IntFilter<"Block"> | number
    blockedId?: IntFilter<"Block"> | number
    createdAt?: DateTimeFilter<"Block"> | Date | string
  }

  export type BlockUpsertWithWhereUniqueWithoutBlockedInput = {
    where: BlockWhereUniqueInput
    update: XOR<BlockUpdateWithoutBlockedInput, BlockUncheckedUpdateWithoutBlockedInput>
    create: XOR<BlockCreateWithoutBlockedInput, BlockUncheckedCreateWithoutBlockedInput>
  }

  export type BlockUpdateWithWhereUniqueWithoutBlockedInput = {
    where: BlockWhereUniqueInput
    data: XOR<BlockUpdateWithoutBlockedInput, BlockUncheckedUpdateWithoutBlockedInput>
  }

  export type BlockUpdateManyWithWhereWithoutBlockedInput = {
    where: BlockScalarWhereInput
    data: XOR<BlockUpdateManyMutationInput, BlockUncheckedUpdateManyWithoutBlockedInput>
  }

  export type UserCreateWithoutGameRecordInput = {
    email: string
    password: string
    username: string
    profileImage?: string | null
    bio?: string | null
    sentMessages?: DirectMessageCreateNestedManyWithoutSenderInput
    receivedMessages?: DirectMessageCreateNestedManyWithoutReceiverInput
    appliedFriendships?: FriendshipCreateNestedManyWithoutApplicantInput
    receivedFriendships?: FriendshipCreateNestedManyWithoutApproverInput
    blocksMade?: BlockCreateNestedManyWithoutBlockerInput
    blocksReceived?: BlockCreateNestedManyWithoutBlockedInput
  }

  export type UserUncheckedCreateWithoutGameRecordInput = {
    id?: number
    email: string
    password: string
    username: string
    profileImage?: string | null
    bio?: string | null
    sentMessages?: DirectMessageUncheckedCreateNestedManyWithoutSenderInput
    receivedMessages?: DirectMessageUncheckedCreateNestedManyWithoutReceiverInput
    appliedFriendships?: FriendshipUncheckedCreateNestedManyWithoutApplicantInput
    receivedFriendships?: FriendshipUncheckedCreateNestedManyWithoutApproverInput
    blocksMade?: BlockUncheckedCreateNestedManyWithoutBlockerInput
    blocksReceived?: BlockUncheckedCreateNestedManyWithoutBlockedInput
  }

  export type UserCreateOrConnectWithoutGameRecordInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutGameRecordInput, UserUncheckedCreateWithoutGameRecordInput>
  }

  export type UserUpsertWithoutGameRecordInput = {
    update: XOR<UserUpdateWithoutGameRecordInput, UserUncheckedUpdateWithoutGameRecordInput>
    create: XOR<UserCreateWithoutGameRecordInput, UserUncheckedCreateWithoutGameRecordInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutGameRecordInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutGameRecordInput, UserUncheckedUpdateWithoutGameRecordInput>
  }

  export type UserUpdateWithoutGameRecordInput = {
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    profileImage?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    sentMessages?: DirectMessageUpdateManyWithoutSenderNestedInput
    receivedMessages?: DirectMessageUpdateManyWithoutReceiverNestedInput
    appliedFriendships?: FriendshipUpdateManyWithoutApplicantNestedInput
    receivedFriendships?: FriendshipUpdateManyWithoutApproverNestedInput
    blocksMade?: BlockUpdateManyWithoutBlockerNestedInput
    blocksReceived?: BlockUpdateManyWithoutBlockedNestedInput
  }

  export type UserUncheckedUpdateWithoutGameRecordInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    profileImage?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    sentMessages?: DirectMessageUncheckedUpdateManyWithoutSenderNestedInput
    receivedMessages?: DirectMessageUncheckedUpdateManyWithoutReceiverNestedInput
    appliedFriendships?: FriendshipUncheckedUpdateManyWithoutApplicantNestedInput
    receivedFriendships?: FriendshipUncheckedUpdateManyWithoutApproverNestedInput
    blocksMade?: BlockUncheckedUpdateManyWithoutBlockerNestedInput
    blocksReceived?: BlockUncheckedUpdateManyWithoutBlockedNestedInput
  }

  export type UserCreateWithoutAppliedFriendshipsInput = {
    email: string
    password: string
    username: string
    profileImage?: string | null
    bio?: string | null
    gameRecord?: ItoGameRecordCreateNestedOneWithoutUserInput
    sentMessages?: DirectMessageCreateNestedManyWithoutSenderInput
    receivedMessages?: DirectMessageCreateNestedManyWithoutReceiverInput
    receivedFriendships?: FriendshipCreateNestedManyWithoutApproverInput
    blocksMade?: BlockCreateNestedManyWithoutBlockerInput
    blocksReceived?: BlockCreateNestedManyWithoutBlockedInput
  }

  export type UserUncheckedCreateWithoutAppliedFriendshipsInput = {
    id?: number
    email: string
    password: string
    username: string
    profileImage?: string | null
    bio?: string | null
    gameRecord?: ItoGameRecordUncheckedCreateNestedOneWithoutUserInput
    sentMessages?: DirectMessageUncheckedCreateNestedManyWithoutSenderInput
    receivedMessages?: DirectMessageUncheckedCreateNestedManyWithoutReceiverInput
    receivedFriendships?: FriendshipUncheckedCreateNestedManyWithoutApproverInput
    blocksMade?: BlockUncheckedCreateNestedManyWithoutBlockerInput
    blocksReceived?: BlockUncheckedCreateNestedManyWithoutBlockedInput
  }

  export type UserCreateOrConnectWithoutAppliedFriendshipsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutAppliedFriendshipsInput, UserUncheckedCreateWithoutAppliedFriendshipsInput>
  }

  export type UserCreateWithoutReceivedFriendshipsInput = {
    email: string
    password: string
    username: string
    profileImage?: string | null
    bio?: string | null
    gameRecord?: ItoGameRecordCreateNestedOneWithoutUserInput
    sentMessages?: DirectMessageCreateNestedManyWithoutSenderInput
    receivedMessages?: DirectMessageCreateNestedManyWithoutReceiverInput
    appliedFriendships?: FriendshipCreateNestedManyWithoutApplicantInput
    blocksMade?: BlockCreateNestedManyWithoutBlockerInput
    blocksReceived?: BlockCreateNestedManyWithoutBlockedInput
  }

  export type UserUncheckedCreateWithoutReceivedFriendshipsInput = {
    id?: number
    email: string
    password: string
    username: string
    profileImage?: string | null
    bio?: string | null
    gameRecord?: ItoGameRecordUncheckedCreateNestedOneWithoutUserInput
    sentMessages?: DirectMessageUncheckedCreateNestedManyWithoutSenderInput
    receivedMessages?: DirectMessageUncheckedCreateNestedManyWithoutReceiverInput
    appliedFriendships?: FriendshipUncheckedCreateNestedManyWithoutApplicantInput
    blocksMade?: BlockUncheckedCreateNestedManyWithoutBlockerInput
    blocksReceived?: BlockUncheckedCreateNestedManyWithoutBlockedInput
  }

  export type UserCreateOrConnectWithoutReceivedFriendshipsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutReceivedFriendshipsInput, UserUncheckedCreateWithoutReceivedFriendshipsInput>
  }

  export type UserUpsertWithoutAppliedFriendshipsInput = {
    update: XOR<UserUpdateWithoutAppliedFriendshipsInput, UserUncheckedUpdateWithoutAppliedFriendshipsInput>
    create: XOR<UserCreateWithoutAppliedFriendshipsInput, UserUncheckedCreateWithoutAppliedFriendshipsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutAppliedFriendshipsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutAppliedFriendshipsInput, UserUncheckedUpdateWithoutAppliedFriendshipsInput>
  }

  export type UserUpdateWithoutAppliedFriendshipsInput = {
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    profileImage?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    gameRecord?: ItoGameRecordUpdateOneWithoutUserNestedInput
    sentMessages?: DirectMessageUpdateManyWithoutSenderNestedInput
    receivedMessages?: DirectMessageUpdateManyWithoutReceiverNestedInput
    receivedFriendships?: FriendshipUpdateManyWithoutApproverNestedInput
    blocksMade?: BlockUpdateManyWithoutBlockerNestedInput
    blocksReceived?: BlockUpdateManyWithoutBlockedNestedInput
  }

  export type UserUncheckedUpdateWithoutAppliedFriendshipsInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    profileImage?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    gameRecord?: ItoGameRecordUncheckedUpdateOneWithoutUserNestedInput
    sentMessages?: DirectMessageUncheckedUpdateManyWithoutSenderNestedInput
    receivedMessages?: DirectMessageUncheckedUpdateManyWithoutReceiverNestedInput
    receivedFriendships?: FriendshipUncheckedUpdateManyWithoutApproverNestedInput
    blocksMade?: BlockUncheckedUpdateManyWithoutBlockerNestedInput
    blocksReceived?: BlockUncheckedUpdateManyWithoutBlockedNestedInput
  }

  export type UserUpsertWithoutReceivedFriendshipsInput = {
    update: XOR<UserUpdateWithoutReceivedFriendshipsInput, UserUncheckedUpdateWithoutReceivedFriendshipsInput>
    create: XOR<UserCreateWithoutReceivedFriendshipsInput, UserUncheckedCreateWithoutReceivedFriendshipsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutReceivedFriendshipsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutReceivedFriendshipsInput, UserUncheckedUpdateWithoutReceivedFriendshipsInput>
  }

  export type UserUpdateWithoutReceivedFriendshipsInput = {
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    profileImage?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    gameRecord?: ItoGameRecordUpdateOneWithoutUserNestedInput
    sentMessages?: DirectMessageUpdateManyWithoutSenderNestedInput
    receivedMessages?: DirectMessageUpdateManyWithoutReceiverNestedInput
    appliedFriendships?: FriendshipUpdateManyWithoutApplicantNestedInput
    blocksMade?: BlockUpdateManyWithoutBlockerNestedInput
    blocksReceived?: BlockUpdateManyWithoutBlockedNestedInput
  }

  export type UserUncheckedUpdateWithoutReceivedFriendshipsInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    profileImage?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    gameRecord?: ItoGameRecordUncheckedUpdateOneWithoutUserNestedInput
    sentMessages?: DirectMessageUncheckedUpdateManyWithoutSenderNestedInput
    receivedMessages?: DirectMessageUncheckedUpdateManyWithoutReceiverNestedInput
    appliedFriendships?: FriendshipUncheckedUpdateManyWithoutApplicantNestedInput
    blocksMade?: BlockUncheckedUpdateManyWithoutBlockerNestedInput
    blocksReceived?: BlockUncheckedUpdateManyWithoutBlockedNestedInput
  }

  export type UserCreateWithoutBlocksMadeInput = {
    email: string
    password: string
    username: string
    profileImage?: string | null
    bio?: string | null
    gameRecord?: ItoGameRecordCreateNestedOneWithoutUserInput
    sentMessages?: DirectMessageCreateNestedManyWithoutSenderInput
    receivedMessages?: DirectMessageCreateNestedManyWithoutReceiverInput
    appliedFriendships?: FriendshipCreateNestedManyWithoutApplicantInput
    receivedFriendships?: FriendshipCreateNestedManyWithoutApproverInput
    blocksReceived?: BlockCreateNestedManyWithoutBlockedInput
  }

  export type UserUncheckedCreateWithoutBlocksMadeInput = {
    id?: number
    email: string
    password: string
    username: string
    profileImage?: string | null
    bio?: string | null
    gameRecord?: ItoGameRecordUncheckedCreateNestedOneWithoutUserInput
    sentMessages?: DirectMessageUncheckedCreateNestedManyWithoutSenderInput
    receivedMessages?: DirectMessageUncheckedCreateNestedManyWithoutReceiverInput
    appliedFriendships?: FriendshipUncheckedCreateNestedManyWithoutApplicantInput
    receivedFriendships?: FriendshipUncheckedCreateNestedManyWithoutApproverInput
    blocksReceived?: BlockUncheckedCreateNestedManyWithoutBlockedInput
  }

  export type UserCreateOrConnectWithoutBlocksMadeInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutBlocksMadeInput, UserUncheckedCreateWithoutBlocksMadeInput>
  }

  export type UserCreateWithoutBlocksReceivedInput = {
    email: string
    password: string
    username: string
    profileImage?: string | null
    bio?: string | null
    gameRecord?: ItoGameRecordCreateNestedOneWithoutUserInput
    sentMessages?: DirectMessageCreateNestedManyWithoutSenderInput
    receivedMessages?: DirectMessageCreateNestedManyWithoutReceiverInput
    appliedFriendships?: FriendshipCreateNestedManyWithoutApplicantInput
    receivedFriendships?: FriendshipCreateNestedManyWithoutApproverInput
    blocksMade?: BlockCreateNestedManyWithoutBlockerInput
  }

  export type UserUncheckedCreateWithoutBlocksReceivedInput = {
    id?: number
    email: string
    password: string
    username: string
    profileImage?: string | null
    bio?: string | null
    gameRecord?: ItoGameRecordUncheckedCreateNestedOneWithoutUserInput
    sentMessages?: DirectMessageUncheckedCreateNestedManyWithoutSenderInput
    receivedMessages?: DirectMessageUncheckedCreateNestedManyWithoutReceiverInput
    appliedFriendships?: FriendshipUncheckedCreateNestedManyWithoutApplicantInput
    receivedFriendships?: FriendshipUncheckedCreateNestedManyWithoutApproverInput
    blocksMade?: BlockUncheckedCreateNestedManyWithoutBlockerInput
  }

  export type UserCreateOrConnectWithoutBlocksReceivedInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutBlocksReceivedInput, UserUncheckedCreateWithoutBlocksReceivedInput>
  }

  export type UserUpsertWithoutBlocksMadeInput = {
    update: XOR<UserUpdateWithoutBlocksMadeInput, UserUncheckedUpdateWithoutBlocksMadeInput>
    create: XOR<UserCreateWithoutBlocksMadeInput, UserUncheckedCreateWithoutBlocksMadeInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutBlocksMadeInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutBlocksMadeInput, UserUncheckedUpdateWithoutBlocksMadeInput>
  }

  export type UserUpdateWithoutBlocksMadeInput = {
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    profileImage?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    gameRecord?: ItoGameRecordUpdateOneWithoutUserNestedInput
    sentMessages?: DirectMessageUpdateManyWithoutSenderNestedInput
    receivedMessages?: DirectMessageUpdateManyWithoutReceiverNestedInput
    appliedFriendships?: FriendshipUpdateManyWithoutApplicantNestedInput
    receivedFriendships?: FriendshipUpdateManyWithoutApproverNestedInput
    blocksReceived?: BlockUpdateManyWithoutBlockedNestedInput
  }

  export type UserUncheckedUpdateWithoutBlocksMadeInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    profileImage?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    gameRecord?: ItoGameRecordUncheckedUpdateOneWithoutUserNestedInput
    sentMessages?: DirectMessageUncheckedUpdateManyWithoutSenderNestedInput
    receivedMessages?: DirectMessageUncheckedUpdateManyWithoutReceiverNestedInput
    appliedFriendships?: FriendshipUncheckedUpdateManyWithoutApplicantNestedInput
    receivedFriendships?: FriendshipUncheckedUpdateManyWithoutApproverNestedInput
    blocksReceived?: BlockUncheckedUpdateManyWithoutBlockedNestedInput
  }

  export type UserUpsertWithoutBlocksReceivedInput = {
    update: XOR<UserUpdateWithoutBlocksReceivedInput, UserUncheckedUpdateWithoutBlocksReceivedInput>
    create: XOR<UserCreateWithoutBlocksReceivedInput, UserUncheckedCreateWithoutBlocksReceivedInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutBlocksReceivedInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutBlocksReceivedInput, UserUncheckedUpdateWithoutBlocksReceivedInput>
  }

  export type UserUpdateWithoutBlocksReceivedInput = {
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    profileImage?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    gameRecord?: ItoGameRecordUpdateOneWithoutUserNestedInput
    sentMessages?: DirectMessageUpdateManyWithoutSenderNestedInput
    receivedMessages?: DirectMessageUpdateManyWithoutReceiverNestedInput
    appliedFriendships?: FriendshipUpdateManyWithoutApplicantNestedInput
    receivedFriendships?: FriendshipUpdateManyWithoutApproverNestedInput
    blocksMade?: BlockUpdateManyWithoutBlockerNestedInput
  }

  export type UserUncheckedUpdateWithoutBlocksReceivedInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    profileImage?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    gameRecord?: ItoGameRecordUncheckedUpdateOneWithoutUserNestedInput
    sentMessages?: DirectMessageUncheckedUpdateManyWithoutSenderNestedInput
    receivedMessages?: DirectMessageUncheckedUpdateManyWithoutReceiverNestedInput
    appliedFriendships?: FriendshipUncheckedUpdateManyWithoutApplicantNestedInput
    receivedFriendships?: FriendshipUncheckedUpdateManyWithoutApproverNestedInput
    blocksMade?: BlockUncheckedUpdateManyWithoutBlockerNestedInput
  }

  export type UserCreateWithoutSentMessagesInput = {
    email: string
    password: string
    username: string
    profileImage?: string | null
    bio?: string | null
    gameRecord?: ItoGameRecordCreateNestedOneWithoutUserInput
    receivedMessages?: DirectMessageCreateNestedManyWithoutReceiverInput
    appliedFriendships?: FriendshipCreateNestedManyWithoutApplicantInput
    receivedFriendships?: FriendshipCreateNestedManyWithoutApproverInput
    blocksMade?: BlockCreateNestedManyWithoutBlockerInput
    blocksReceived?: BlockCreateNestedManyWithoutBlockedInput
  }

  export type UserUncheckedCreateWithoutSentMessagesInput = {
    id?: number
    email: string
    password: string
    username: string
    profileImage?: string | null
    bio?: string | null
    gameRecord?: ItoGameRecordUncheckedCreateNestedOneWithoutUserInput
    receivedMessages?: DirectMessageUncheckedCreateNestedManyWithoutReceiverInput
    appliedFriendships?: FriendshipUncheckedCreateNestedManyWithoutApplicantInput
    receivedFriendships?: FriendshipUncheckedCreateNestedManyWithoutApproverInput
    blocksMade?: BlockUncheckedCreateNestedManyWithoutBlockerInput
    blocksReceived?: BlockUncheckedCreateNestedManyWithoutBlockedInput
  }

  export type UserCreateOrConnectWithoutSentMessagesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutSentMessagesInput, UserUncheckedCreateWithoutSentMessagesInput>
  }

  export type UserCreateWithoutReceivedMessagesInput = {
    email: string
    password: string
    username: string
    profileImage?: string | null
    bio?: string | null
    gameRecord?: ItoGameRecordCreateNestedOneWithoutUserInput
    sentMessages?: DirectMessageCreateNestedManyWithoutSenderInput
    appliedFriendships?: FriendshipCreateNestedManyWithoutApplicantInput
    receivedFriendships?: FriendshipCreateNestedManyWithoutApproverInput
    blocksMade?: BlockCreateNestedManyWithoutBlockerInput
    blocksReceived?: BlockCreateNestedManyWithoutBlockedInput
  }

  export type UserUncheckedCreateWithoutReceivedMessagesInput = {
    id?: number
    email: string
    password: string
    username: string
    profileImage?: string | null
    bio?: string | null
    gameRecord?: ItoGameRecordUncheckedCreateNestedOneWithoutUserInput
    sentMessages?: DirectMessageUncheckedCreateNestedManyWithoutSenderInput
    appliedFriendships?: FriendshipUncheckedCreateNestedManyWithoutApplicantInput
    receivedFriendships?: FriendshipUncheckedCreateNestedManyWithoutApproverInput
    blocksMade?: BlockUncheckedCreateNestedManyWithoutBlockerInput
    blocksReceived?: BlockUncheckedCreateNestedManyWithoutBlockedInput
  }

  export type UserCreateOrConnectWithoutReceivedMessagesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutReceivedMessagesInput, UserUncheckedCreateWithoutReceivedMessagesInput>
  }

  export type UserUpsertWithoutSentMessagesInput = {
    update: XOR<UserUpdateWithoutSentMessagesInput, UserUncheckedUpdateWithoutSentMessagesInput>
    create: XOR<UserCreateWithoutSentMessagesInput, UserUncheckedCreateWithoutSentMessagesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutSentMessagesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutSentMessagesInput, UserUncheckedUpdateWithoutSentMessagesInput>
  }

  export type UserUpdateWithoutSentMessagesInput = {
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    profileImage?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    gameRecord?: ItoGameRecordUpdateOneWithoutUserNestedInput
    receivedMessages?: DirectMessageUpdateManyWithoutReceiverNestedInput
    appliedFriendships?: FriendshipUpdateManyWithoutApplicantNestedInput
    receivedFriendships?: FriendshipUpdateManyWithoutApproverNestedInput
    blocksMade?: BlockUpdateManyWithoutBlockerNestedInput
    blocksReceived?: BlockUpdateManyWithoutBlockedNestedInput
  }

  export type UserUncheckedUpdateWithoutSentMessagesInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    profileImage?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    gameRecord?: ItoGameRecordUncheckedUpdateOneWithoutUserNestedInput
    receivedMessages?: DirectMessageUncheckedUpdateManyWithoutReceiverNestedInput
    appliedFriendships?: FriendshipUncheckedUpdateManyWithoutApplicantNestedInput
    receivedFriendships?: FriendshipUncheckedUpdateManyWithoutApproverNestedInput
    blocksMade?: BlockUncheckedUpdateManyWithoutBlockerNestedInput
    blocksReceived?: BlockUncheckedUpdateManyWithoutBlockedNestedInput
  }

  export type UserUpsertWithoutReceivedMessagesInput = {
    update: XOR<UserUpdateWithoutReceivedMessagesInput, UserUncheckedUpdateWithoutReceivedMessagesInput>
    create: XOR<UserCreateWithoutReceivedMessagesInput, UserUncheckedCreateWithoutReceivedMessagesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutReceivedMessagesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutReceivedMessagesInput, UserUncheckedUpdateWithoutReceivedMessagesInput>
  }

  export type UserUpdateWithoutReceivedMessagesInput = {
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    profileImage?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    gameRecord?: ItoGameRecordUpdateOneWithoutUserNestedInput
    sentMessages?: DirectMessageUpdateManyWithoutSenderNestedInput
    appliedFriendships?: FriendshipUpdateManyWithoutApplicantNestedInput
    receivedFriendships?: FriendshipUpdateManyWithoutApproverNestedInput
    blocksMade?: BlockUpdateManyWithoutBlockerNestedInput
    blocksReceived?: BlockUpdateManyWithoutBlockedNestedInput
  }

  export type UserUncheckedUpdateWithoutReceivedMessagesInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    profileImage?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    gameRecord?: ItoGameRecordUncheckedUpdateOneWithoutUserNestedInput
    sentMessages?: DirectMessageUncheckedUpdateManyWithoutSenderNestedInput
    appliedFriendships?: FriendshipUncheckedUpdateManyWithoutApplicantNestedInput
    receivedFriendships?: FriendshipUncheckedUpdateManyWithoutApproverNestedInput
    blocksMade?: BlockUncheckedUpdateManyWithoutBlockerNestedInput
    blocksReceived?: BlockUncheckedUpdateManyWithoutBlockedNestedInput
  }

  export type DirectMessageCreateManySenderInput = {
    id?: number
    receiverId: number
    content: string
    createdAt?: Date | string
  }

  export type DirectMessageCreateManyReceiverInput = {
    id?: number
    senderId: number
    content: string
    createdAt?: Date | string
  }

  export type FriendshipCreateManyApplicantInput = {
    id?: number
    approverId: number
    status?: string
    createdAt?: Date | string
  }

  export type FriendshipCreateManyApproverInput = {
    id?: number
    applicantId: number
    status?: string
    createdAt?: Date | string
  }

  export type BlockCreateManyBlockerInput = {
    id?: number
    blockedId: number
    createdAt?: Date | string
  }

  export type BlockCreateManyBlockedInput = {
    id?: number
    blockerId: number
    createdAt?: Date | string
  }

  export type DirectMessageUpdateWithoutSenderInput = {
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    receiver?: UserUpdateOneRequiredWithoutReceivedMessagesNestedInput
  }

  export type DirectMessageUncheckedUpdateWithoutSenderInput = {
    id?: IntFieldUpdateOperationsInput | number
    receiverId?: IntFieldUpdateOperationsInput | number
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DirectMessageUncheckedUpdateManyWithoutSenderInput = {
    id?: IntFieldUpdateOperationsInput | number
    receiverId?: IntFieldUpdateOperationsInput | number
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DirectMessageUpdateWithoutReceiverInput = {
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sender?: UserUpdateOneRequiredWithoutSentMessagesNestedInput
  }

  export type DirectMessageUncheckedUpdateWithoutReceiverInput = {
    id?: IntFieldUpdateOperationsInput | number
    senderId?: IntFieldUpdateOperationsInput | number
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DirectMessageUncheckedUpdateManyWithoutReceiverInput = {
    id?: IntFieldUpdateOperationsInput | number
    senderId?: IntFieldUpdateOperationsInput | number
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FriendshipUpdateWithoutApplicantInput = {
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    approver?: UserUpdateOneRequiredWithoutReceivedFriendshipsNestedInput
  }

  export type FriendshipUncheckedUpdateWithoutApplicantInput = {
    id?: IntFieldUpdateOperationsInput | number
    approverId?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FriendshipUncheckedUpdateManyWithoutApplicantInput = {
    id?: IntFieldUpdateOperationsInput | number
    approverId?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FriendshipUpdateWithoutApproverInput = {
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    applicant?: UserUpdateOneRequiredWithoutAppliedFriendshipsNestedInput
  }

  export type FriendshipUncheckedUpdateWithoutApproverInput = {
    id?: IntFieldUpdateOperationsInput | number
    applicantId?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FriendshipUncheckedUpdateManyWithoutApproverInput = {
    id?: IntFieldUpdateOperationsInput | number
    applicantId?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlockUpdateWithoutBlockerInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    blocked?: UserUpdateOneRequiredWithoutBlocksReceivedNestedInput
  }

  export type BlockUncheckedUpdateWithoutBlockerInput = {
    id?: IntFieldUpdateOperationsInput | number
    blockedId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlockUncheckedUpdateManyWithoutBlockerInput = {
    id?: IntFieldUpdateOperationsInput | number
    blockedId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlockUpdateWithoutBlockedInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    blocker?: UserUpdateOneRequiredWithoutBlocksMadeNestedInput
  }

  export type BlockUncheckedUpdateWithoutBlockedInput = {
    id?: IntFieldUpdateOperationsInput | number
    blockerId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlockUncheckedUpdateManyWithoutBlockedInput = {
    id?: IntFieldUpdateOperationsInput | number
    blockerId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}