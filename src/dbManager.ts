import {MongoClient, ServerApiVersion} from "mongodb";
import utils from "./utils";

let dbClient: MongoClient | undefined;
let dbName: string;
const insertQueue = new Map<string, Array<Object>>();
let enqueuerEnabled = false;

async function connect(): Promise<void> {
    const dbUser = utils.verifyAndGetRequiredEnvVariable("DB_USER");
    const dbPsw = utils.verifyAndGetRequiredEnvVariable("DB_PSW");
    const dbHost = utils.verifyAndGetRequiredEnvVariable("DB_HOST");
    dbName = utils.verifyAndGetRequiredEnvVariable("DB_NAME");

    const url = `mongodb+srv://${dbUser}:${dbPsw}@${dbHost}/?retryWrites=true&w=majority`;
    dbClient = new MongoClient(url, {serverApi: ServerApiVersion.v1});
    await dbClient.connect();
}

async function enqueueInsert<T>(collection: string, obj: T): Promise<void> {
    if(enqueuerEnabled) {
        // Check if there are already elements in the queue for the same collection
        if(insertQueue.has(collection)) {
            const collectionQueue = insertQueue.get(collection);
            collectionQueue?.push(obj as any);
        } else {
            // There's nothing in the queue for the current collection, add a new one
            const collectionQueue = new Array<any>();
            collectionQueue.push(obj);
            insertQueue.set(collection, collectionQueue);
        }
    } else {
        await insertManyInCollection(collection, [obj]);
    }
}

async function findNElementsFromCollection<T>(collection: string, numElements: number, hint: any, filter: any): Promise<T> {
    if(dbClient === undefined) {
        throw new Error("DB connection was not open");
    }

    const db = dbClient.db(dbName);
    return await (db.collection(collection)
        .find()
        .hint(hint)
        .limit(numElements)
        .project(filter)
        .toArray()
    ) as T;
}

async function findAverageOfNElementsFromCollection<T>(collection: string, numElements: number, sort: any, filter: any, averageField: string): Promise<T> {
    if(dbClient === undefined) {
        throw new Error("DB connection was not open");
    }

    const db = dbClient.db(dbName);
    return await (db.collection(collection)
        .aggregate([
            {
                $sort: sort
            },
            {
                $limit: numElements
            },
            {
                $group: {
                    _id: null,
                    average: {$avg: averageField}
                }
            }
        ])
        .project(filter)
        .next()
    ) as T;
}

function startInsertBundlerTask(): void {
    enqueuerEnabled = true;
    setInterval(async () => {
        // Iterate map and for each collection with documents pending, perfrom an insertMany
        insertQueue.forEach(async (value, key) => {
            console.info("Sending", value, "for collection", key);

            await insertManyInCollection(key, value);

            // Remove items from queue
            insertQueue.delete(key);
        });
    }, 1000);
}

async function insertManyInCollection(collection: string, documents: Array<any>): Promise<void> {
    if(dbClient === undefined) {
        throw new Error("DB connection was not open");
    }
    const db = dbClient.db(dbName);
    await db.collection(collection).insertMany(documents);
}

async function deleteAllFromCollection(collection: string): Promise<void> {
    if(dbClient === undefined) {
        throw new Error("DB connection was not open");
    }

    const db = dbClient.db(dbName);
    await db.collection(collection).deleteMany({});
}

export default {
    connect,
    enqueueInsert,
    findNElementsFromCollection,
    startInsertBundlerTask,
    findAverageOfNElementsFromCollection,
    deleteAllFromCollection
};