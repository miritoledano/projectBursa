class DatabaseAdapter {
    connect() {
        throw new Error("Method 'connect()' must be implemented.");
    }

    query(sql) {
        throw new Error("Method 'query()' must be implemented.");
    } 

    disconnect() {
        throw new Error("Method 'disconnect()' must be implemented.");
    }
}



module.exports = DatabaseAdapter;