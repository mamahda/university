# Find CUSTOMERNAME who purchased albums released in both 2016 and 2021:
SELECT r.customername
FROM
    receipt r
    JOIN detailitem d ON r.receiptno = d.receiptno
    JOIN album a ON a.albumno = d.albumno
WHERE
    a.releaseyear IN (2016, 2021)
GROUP BY
    r.customername
HAVING
    COUNT(DISTINCT a.releaseyear) = 2;