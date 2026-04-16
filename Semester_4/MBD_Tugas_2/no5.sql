# Find the percentage of the number of Tulus’s albums sold to the total albums sold (the percentage must be rounded to 2 decimal places):
SELECT ROUND(
        100.0 * SUM(
            CASE
                WHEN s.singername = 'TULUS' THEN d.amount
                ELSE 0
            END
        ) / SUM(d.amount), 2
    ) AS percentage
FROM
    detailitem d
    JOIN album a ON d.albumno = a.albumno
    JOIN singer s ON a.singerid = s.singerid;