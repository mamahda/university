# Find SINGERNAME who released an album before the album titled “LYODRA” was released:
SELECT DISTINCT
    s.singername
FROM singer s
    JOIN album a ON s.singerid = a.singerid
WHERE
    a.releaseyear < (
        SELECT releaseyear
        FROM album
        WHERE
            albumname = 'LYODRA'
    );