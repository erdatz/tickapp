export class Result {
    #ok; #value; #error;
  
    constructor(ok, value, error) {
      this.#ok = ok;
      this.#value = value;
      this.#error = error;
    }
  
    static ok(value) {
      return new Result(true, value, null);
    }
  
    static err(error) {
      return new Result(false, null, error);
    }
  
    get isOk()  { return this.#ok; }
    get isErr() { return !this.#ok; }
    get value() { return this.#value; }
    get error() { return this.#error; }
  
    map(fn) {
      return this.isOk ? Result.ok(fn(this.value)) : this;
    }
  
    mapErr(fn) {
      return this.isErr ? Result.err(fn(this.error)) : this;
    }
  
    andThen(fn) {
      return this.isOk ? fn(this.value) : this;
    }
  
    static async fromPromise(promise, mapErr = (e) => e) {
      try {
        const v = await promise;
        return Result.ok(v);
      } catch (e) {
        return Result.err(mapErr(e));
      }
    }
  
    static fromTry(fn, mapErr = (e) => e) {
      try {
        const v = fn();
        return Result.ok(v);
      } catch (e) {
        return Result.err(mapErr(e));
      }
    }
}

export default Result;
  