export default class Queue<T> {

    private store: Array<T>;

    constructor() {
        this.store = new Array<T>();
    }

    push(item: T) {
        this.store.push(item);
    }

    pop(): T {
        return this.store.shift() || null;
    }

}