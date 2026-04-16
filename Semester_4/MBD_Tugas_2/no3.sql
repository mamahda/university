# Find other SINGERNAME whose album prices are higher than the prices of some albums by Tulus:
SELECT DISTINCT
    s.singername
FROM singer s
    JOIN album a ON s.singerid = a.singerid
WHERE
    s.singername <> 'TULUS'
    AND a.price > ANY (
        SELECT al.price
        FROM album al
            JOIN singer si ON al.singerid = si.singerid
        WHERE
            si.singername = 'TULUS'
    );