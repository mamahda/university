// ===== Soal 1: Graph database silsilah keluarga =====
MATCH (n) DETACH DELETE n;

CREATE (:JenisKelamin {nama: 'Laki-laki'}), (:JenisKelamin {nama: 'Perempuan'});

UNWIND [
  ['Samat','L'], ['Yati','P'],
  ['Imam','L'], ['Tini','P'], ['Hari','L'], ['Rini','P'],
  ['Niko','L'], ['Pujiati','P'], ['Martin','L'], ['Nanik','P'],
  ['Aan','L'], ['Thressye','P'], ['Yesa','L'], ['Erphan','L'], ['Kristi','P'],
  ['Bernard','L'], ['Dian','P'], ['Fena','P']
] AS row
MATCH (jk:JenisKelamin {nama: CASE row[1] WHEN 'L' THEN 'Laki-laki' ELSE 'Perempuan' END})
CREATE (o:Orang {nama: row[0]})-[:`berjenis-kelamin`]->(jk);

UNWIND [
  ['Samat','Yati'], ['Imam','Tini'], ['Hari','Rini'], ['Niko','Pujiati'], ['Martin','Nanik']
] AS p
MATCH (a:Orang {nama: p[0]}), (b:Orang {nama: p[1]})
CREATE (a)-[:`berpasangan-dengan`]->(b);

UNWIND [
  ['Samat','Imam'], ['Samat','Hari'], ['Samat','Pujiati'], ['Samat','Nanik'],
  ['Imam','Aan'], ['Imam','Thressye'],
  ['Hari','Yesa'], ['Hari','Erphan'], ['Hari','Kristi'],
  ['Niko','Bernard'],
  ['Martin','Dian'], ['Martin','Fena']
] AS r
MATCH (ortu:Orang {nama: r[0]})-[:`berpasangan-dengan`]-(pasangan:Orang), (anak:Orang {nama: r[1]})
CREATE (ortu)-[:`memiliki-anak`]->(anak), (pasangan)-[:`memiliki-anak`]->(anak);

// ===== Soal 2: Inferensi relasi sepupu =====
// Sepupu = anak dari dua orang yang bersaudara (punya orang tua yang sama).
// Tidak boleh menikah jika jenis kelamin sama ATAU ayah keduanya bersaudara.
MATCH (a:Orang)<-[:`memiliki-anak`]-(pa:Orang)<-[:`memiliki-anak`]-(kakek:Orang)
      -[:`memiliki-anak`]->(pb:Orang)-[:`memiliki-anak`]->(b:Orang)
WHERE pa <> pb AND a.nama < b.nama
  AND NOT EXISTS { (x:Orang)-[:`memiliki-anak`]->(a), (x)-[:`memiliki-anak`]->(b) }
WITH DISTINCT a, b
MATCH (a)-[:`berjenis-kelamin`]->(jka), (b)-[:`berjenis-kelamin`]->(jkb)
MATCH (ayahA:Orang)-[:`memiliki-anak`]->(a), (ayahA)-[:`berjenis-kelamin`]->(:JenisKelamin {nama: 'Laki-laki'})
MATCH (ayahB:Orang)-[:`memiliki-anak`]->(b), (ayahB)-[:`berjenis-kelamin`]->(:JenisKelamin {nama: 'Laki-laki'})
WITH a, b, jka = jkb AS sejenis,
     EXISTS { (g:Orang)-[:`memiliki-anak`]->(ayahA), (g)-[:`memiliki-anak`]->(ayahB) } AS ayahBersaudara
FOREACH (_ IN CASE WHEN sejenis OR ayahBersaudara THEN [1] ELSE [] END |
  MERGE (a)-[:`sepupu-tidak-boleh-menikah`]->(b))
FOREACH (_ IN CASE WHEN NOT (sejenis OR ayahBersaudara) THEN [1] ELSE [] END |
  MERGE (a)-[:`sepupu-boleh-menikah`]->(b));
