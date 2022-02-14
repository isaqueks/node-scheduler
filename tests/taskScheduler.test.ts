import TaskScheduler from "../index";

const MULTI_MAX_TASKS = 100;
const SPAWN_TASKS = 2000;
const DELAY = 200;

jest.setTimeout(120 * 1000);

describe('TaskScheduler test', () => {

    const scheduler = new TaskScheduler<number, string>(MULTI_MAX_TASKS, x => {
        return new Promise<string>((resolve, reject) => {
            setTimeout(() => {
                if (x == 10) {
                    reject('x cannot be 10!')
                }
                else {
                    resolve(`Test #${x}`);
                }
            }, DELAY);
        });
    });


    test('Schedule test', async () => {

        const promises = [];

        const start = Date.now();

        let succ = 0, err = 0;

        for (let i = 0; i < SPAWN_TASKS; i++) {
            promises.push(new Promise<void>((resolve, reject) => {
                scheduler.schedule(i, (error, out) => {
                    
                    if (error) {
                        expect(i).toEqual(10);
                        expect(error).toEqual(`x cannot be 10!`)
                        err++;
                    }
                    else {
                        expect(out).toEqual(`Test #${i}`);
                        succ++;
                    }

                    resolve();

                });
            }));
        }

        await Promise.all(promises);

        const end = Date.now();

        const time = end - start;

        expect(succ).toEqual(SPAWN_TASKS - 1);
        expect(err).toEqual(1);

        const minTime = SPAWN_TASKS / MULTI_MAX_TASKS * DELAY;
        // 20% tolerance
        const maxTime = (SPAWN_TASKS / MULTI_MAX_TASKS) * (DELAY * 1.2);

        console.log(`Ran: ${time}ms (${minTime}ms - ${maxTime}ms)`);

        expect(time).toBeGreaterThanOrEqual(minTime);
        expect(time).toBeLessThanOrEqual(maxTime);

    });


});