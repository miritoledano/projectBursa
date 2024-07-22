CREATE PROCEDURE CreateStocksTable
AS
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'STOCKS')
    BEGIN
        CREATE TABLE STOCKS (
            Symbol VARCHAR(55) PRIMARY KEY
        )
    END
END

 CREATE PROCEDURE CreateStockPricesTable
AS
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'STOCKPRICES')
    BEGIN
        CREATE TABLE STOCKPRICES (
            Symbol VARCHAR(55),
            [date] DATE,
            [open] FLOAT,
            high FLOAT,
            low FLOAT,
            [close] FLOAT,
            volume BIGINT,
            PRIMARY KEY (Symbol, [date]),
            FOREIGN KEY (Symbol) REFERENCES STOCKS(Symbol)
        )
    END
END
CREATE PROCEDURE InsertIntoStocks
    @symbol VARCHAR(55)
AS
BEGIN
    IF NOT EXISTS (SELECT * FROM STOCKS WHERE Symbol = @symbol)
    BEGIN
        INSERT INTO STOCKS (Symbol)
        VALUES (@symbol)
    END
END
CREATE PROCEDURE InsertIntoStockPrices
    @symbol VARCHAR(55),
    @date DATE,
    @open FLOAT,
    @high FLOAT,
    @low FLOAT,
    @close FLOAT,
    @volume BIGINT
AS
BEGIN
    IF NOT EXISTS (SELECT * FROM STOCKPRICES WHERE Symbol = @symbol AND [date] = @date)
    BEGIN
        INSERT INTO STOCKPRICES (Symbol, [date], [open], high, low, [close], volume)
        VALUES (@symbol, @date, @open, @high, @low, @close, @volume)
    END
END
