import Debug from "debug";
import { join } from "path";
import { Connection, createConnection, getConnectionManager } from "typeorm";

const debug = Debug("orm");

/** A name to assign the db connection being used. */
const connectionName = "default";

const connectionManager = getConnectionManager();

/**
 * Fetches a database connection with the speicified name, creating it if needed.
 * @returns A promise to the requested connection.
 */
export const getConnection = async (): Promise<Connection> => {
    let conn: Connection;

    // Check to see if a connection has already been created.
    if (connectionManager.has(connectionName)) {
        // The connection manager maintains connections when they fail to connect.
        conn = connectionManager.get(connectionName);
        // We don't want this, so make sure we can connect and rethrow error if not.
        if (!conn.isConnected) {
            conn = await conn.connect();
        }
    } else {
        conn = await createConnection({
            type: "postgres",
            name: connectionName,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            entities: [join(__dirname, "../models/**/*")],
            logging: ["error", "warn"]
        });
        debug(`Created a new db connection with options ${conn.options}`);
    }

    return conn;
};

export default getConnection;
