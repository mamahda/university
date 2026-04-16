# Find CUSTOMERNAME and total of TOTALPRICE for each customer (the price must be rounded to 1 decimal places):
SELECT r.customername, ROUND(SUM(d.totalprice), 1) AS total_price
FROM receipt r
    JOIN detailitem d ON r.receiptno = d.receiptno
GROUP BY
    r.customername;