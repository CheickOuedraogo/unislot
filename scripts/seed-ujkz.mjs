import pg from "pg";
import { randomBytes, scryptSync } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ADMIN_URL =
  process.env.ADMIN_DATABASE_URL ?? "postgresql://postgres@127.0.0.1:5432/postgres";
const DB_NAME = "unislot";
const DATABASE_URL =
  process.env.DATABASE_URL ?? `postgresql://postgres@127.0.0.1:5432/${DB_NAME}`;

// Mots de passe
const DIRECTOR_PASSWORD = "12345678";
const TEACHER_PASSWORD = "Ujkz2025!";

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64);
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

async function ensureDatabase() {
  const admin = new pg.Client({ connectionString: ADMIN_URL });
  await admin.connect();
  const { rowCount } = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [DB_NAME]);
  if (rowCount === 0) {
    await admin.query(`CREATE DATABASE "${DB_NAME}"`);
    console.log(`Database "${DB_NAME}" créée.`);
  } else {
    console.log(`Database "${DB_NAME}" existe déjà.`);
  }
  await admin.end();
}

// ---- Données réalistes UJKZ ----

const director = {
  name: "KOBIANE Jean-François",
  first_name: "Jean-François",
  last_name: "KOBIANE",
  email: "hcheick75@gmail.com",
};

const teachers = [
  // SEA - Maths-Info-Physique-Chimie (10)
  { first: "Boukaré", last: "OUEDRAOGO", email: "b.ouedraogo@ujkz.bf", active: true, ufr: "SEA" },
  { first: "Aminata", last: "TRAORE", email: "a.traore@ujkz.bf", active: true, ufr: "SEA" },
  { first: "Moussa", last: "KABORE", email: "m.kabore@ujkz.bf", active: true, ufr: "SEA" },
  { first: "Fatoumata", last: "SAWADOGO", email: "f.sawadogo@ujkz.bf", active: true, ufr: "SEA" },
  { first: "Ibrahim", last: "ZONGO", email: "i.zongo@ujkz.bf", active: true, ufr: "SEA" },
  { first: "Aïssata", last: "NIKIEMA", email: "a.nikiema@ujkz.bf", active: true, ufr: "SEA" },
  { first: "Seydou", last: "COMPAORE", email: "s.compaore@ujkz.bf", active: true, ufr: "SEA" },
  { first: "Mariam", last: "ILBOUDO", email: "m.ilboudo@ujkz.bf", active: true, ufr: "SEA" },
  { first: "Patrick", last: "DUBOIS", email: "p.dubois@ujkz.bf", active: true, ufr: "SEA" },
  { first: "Claire", last: "SMITH", email: "c.smith@ujkz.bf", active: false, ufr: "SEA" },
  // SVT (6)
  { first: "Salif", last: "OUATTARA", email: "s.ouattara@ujkz.bf", active: true, ufr: "SVT" },
  { first: "Wendkuuni", last: "DJIGMA", email: "w.djigma@ujkz.bf", active: true, ufr: "SVT" },
  { first: "Karim", last: "SOMBIE", email: "k.sombie@ujkz.bf", active: true, ufr: "SVT" },
  { first: "Isabelle", last: "KIENDREBEOGO", email: "i.kiendrebeogo@ujkz.bf", active: true, ufr: "SVT" },
  { first: "Jacques", last: "SIMPORE", email: "j.simpore@ujkz.bf", active: true, ufr: "SVT" },
  { first: "Rasmata", last: "TRAORE-SVT", email: "r.traore-svt@ujkz.bf", active: true, ufr: "SVT" },
  // SDS (8)
  { first: "Patrice", last: "ZABSONRE", email: "p.zabsonre@ujkz.bf", active: true, ufr: "SDS" },
  { first: "Adama", last: "KAFANDO", email: "a.kafando@ujkz.bf", active: true, ufr: "SDS" },
  { first: "Aïda", last: "KONE", email: "a.kone@ujkz.bf", active: true, ufr: "SDS" },
  { first: "Boukary", last: "DIALLO", email: "b.diallo@ujkz.bf", active: true, ufr: "SDS" },
  { first: "Noélie", last: "COULIBALY", email: "n.coulibaly@ujkz.bf", active: true, ufr: "SDS" },
  { first: "Hermann", last: "SOMBIE-SDS", email: "h.sombie-sds@ujkz.bf", active: true, ufr: "SDS" },
  { first: "Flora", last: "YAMEOGO", email: "f.yameogo@ujkz.bf", active: true, ufr: "SDS" },
  { first: "Abdou", last: "SANOU", email: "a.sanou@ujkz.bf", active: true, ufr: "SDS" },
  // SH (4)
  { first: "Yacouba", last: "BAMBARA", email: "y.bambara@ujkz.bf", active: true, ufr: "SH" },
  { first: "Sita", last: "OUATTARA-SH", email: "s.ouattara-sh@ujkz.bf", active: true, ufr: "SH" },
  { first: "Mahamady", last: "KAFANDO-SH", email: "m.kafando-sh@ujkz.bf", active: true, ufr: "SH" },
  { first: "Awa", last: "SORE", email: "a.sore@ujkz.bf", active: true, ufr: "SH" },
  // LAC (6)
  { first: "Valérie", last: "ROUAMBA", email: "v.rouamba@ujkz.bf", active: true, ufr: "LAC" },
  { first: "Inoussa", last: "TRAORE-LAC", email: "i.traore-lac@ujkz.bf", active: true, ufr: "LAC" },
  { first: "Bernadette", last: "KABRE", email: "b.kabre@ujkz.bf", active: true, ufr: "LAC" },
  { first: "Didier", last: "GUIGMA", email: "d.guigma@ujkz.bf", active: true, ufr: "LAC" },
  { first: "Safiatou", last: "SAWADOGO-LAC", email: "s.sawadogo-lac@ujkz.bf", active: true, ufr: "LAC" },
  { first: "Jean-Paul", last: "BAYALA", email: "jp.bayala@ujkz.bf", active: false, ufr: "LAC" },
  // Centres + transverses (4)
  { first: "Ousmane", last: "KOANDA", email: "o.koanda@ujkz.bf", active: true, ufr: "IBAM" },
  { first: "Rasmané", last: "YAMBA", email: "r.yamba@ujkz.bf", active: true, ufr: "IGEDD" },
  { first: "Luc", last: "TAPSOBA", email: "l.tapsoba@ujkz.bf", active: true, ufr: "ISSP" },
  { first: "Elise", last: "DA", email: "e.da@ujkz.bf", active: true, ufr: "CUPK" },
];

const classes = [
  // SEA 8
  { name: "MPCI L1", level: "L1", ufr: "SEA" },
  { name: "Informatique L1", level: "L1", ufr: "SEA" },
  { name: "Informatique L2", level: "L2", ufr: "SEA" },
  { name: "Informatique L3", level: "L3", ufr: "SEA" },
  { name: "Data Science M1", level: "M1", ufr: "SEA" },
  { name: "Réseaux & Sécurité M1", level: "M1", ufr: "SEA" },
  { name: "Physique L1", level: "L1", ufr: "SEA" },
  { name: "Chimie L2", level: "L2", ufr: "SEA" },
  // SVT 4
  { name: "SVT L1", level: "L1", ufr: "SVT" },
  { name: "Biologie L2", level: "L2", ufr: "SVT" },
  { name: "Géosciences L3", level: "L3", ufr: "SVT" },
  { name: "Biodiversité M1", level: "M1", ufr: "SVT" },
  // SDS 4
  { name: "Médecine L1", level: "L1", ufr: "SDS" },
  { name: "Pharmacie L1", level: "L1", ufr: "SDS" },
  { name: "TSS Biomédical L1", level: "L1", ufr: "SDS" },
  { name: "Médecine L2", level: "L2", ufr: "SDS" },
  // SH 4
  { name: "Histoire-Géographie L1", level: "L1", ufr: "SH" },
  { name: "Archéologie L2", level: "L2", ufr: "SH" },
  { name: "Philosophie L1", level: "L1", ufr: "SH" },
  { name: "Sociologie L2", level: "L2", ufr: "SH" },
  // LAC 4
  { name: "Lettres Modernes L1", level: "L1", ufr: "LAC" },
  { name: "Linguistique L2", level: "L2", ufr: "LAC" },
  { name: "Communication L1", level: "L1", ufr: "LAC" },
  { name: "Arts & Culture L2", level: "L2", ufr: "LAC" },
  // Instituts / CU 2
  { name: "Marketing IBAM L1", level: "L1", ufr: "IBAM" },
  { name: "Population M1 ISSP", level: "M1", ufr: "ISSP" },
];

const subjects = [
  // SEA
  "Analyse 1", "Algèbre 1", "Algorithmique 1", "Programmation C", "Bases de données", "Réseaux 1", "Systèmes d'Exploitation", "Physique 1 - Mécanique", "Chimie Générale", "Statistiques", "Anglais Scientifique", "Architecture des Ordinateurs", "Analyse 2", "Algèbre 2", "Programmation Python", "Intelligence Artificielle", "Sécurité Informatique", "Génie Logiciel", "Physique 2 - Électromagnétisme", "Chimie Organique", "Mathématiques Discrètes", "Cloud Computing",
  // SVT
  "Biologie Cellulaire", "Physiologie Végétale", "Génétique", "Écologie", "Géologie Générale", "Microbiologie", "Zoologie", "Botanique", "Biochimie SVT", "Biodiversité",
  // SDS
  "Anatomie", "Physiologie", "Biochimie Médicale", "Pharmacologie", "Sémiologie", "Santé Publique", "Pathologie", "Microbiologie Médicale", "Biophysique", "Histologie", "Immunologie", "Parasitologie",
  // SH
  "Histoire Contemporaine", "Géographie Humaine", "Archéologie Africaine", "Méthodologie SH", "Philosophie Générale", "Sociologie Générale", "Épistémologie", "Démographie",
  // LAC
  "Littérature Africaine", "Linguistique Générale", "Théories de la Communication", "Journalisme", "Anglais LAC", "Arts du Spectacle", "Stylistique", "Didactique du Français",
  // Transverses
  "Méthodologie Universitaire", "Informatique Générale", "Anglais", "Entrepreneuriat", "Droit Constitutionnel", "Comptabilité", "Statistiques Sociales",
];

// Matières par classe (réaliste)
const classSubjectsMap = {
  "MPCI L1": ["Analyse 1", "Algèbre 1", "Physique 1 - Mécanique", "Chimie Générale", "Algorithmique 1", "Anglais Scientifique", "Méthodologie Universitaire"],
  "Informatique L1": ["Algorithmique 1", "Programmation C", "Analyse 1", "Architecture des Ordinateurs", "Anglais Scientifique", "Méthodologie Universitaire"],
  "Informatique L2": ["Bases de données", "Réseaux 1", "Systèmes d'Exploitation", "Algorithmique 1", "Statistiques", "Anglais"],
  "Informatique L3": ["Génie Logiciel", "Intelligence Artificielle", "Bases de données", "Réseaux 1", "Programmation Python", "Anglais"],
  "Data Science M1": ["Statistiques", "Intelligence Artificielle", "Bases de données", "Programmation Python", "Cloud Computing", "Anglais Scientifique"],
  "Réseaux & Sécurité M1": ["Réseaux 1", "Sécurité Informatique", "Systèmes d'Exploitation", "Cloud Computing", "Anglais"],
  "Physique L1": ["Physique 1 - Mécanique", "Analyse 1", "Algèbre 1", "Chimie Générale", "Anglais Scientifique"],
  "Chimie L2": ["Chimie Générale", "Chimie Organique", "Physique 2 - Électromagnétisme", "Analyse 2", "Anglais"],
  "SVT L1": ["Biologie Cellulaire", "Géologie Générale", "Chimie Générale", "Écologie", "Anglais", "Méthodologie Universitaire"],
  "Biologie L2": ["Génétique", "Physiologie Végétale", "Microbiologie", "Zoologie", "Biochimie SVT"],
  "Géosciences L3": ["Géologie Générale", "Écologie", "Biodiversité", "Botanique", "Statistiques"],
  "Biodiversité M1": ["Biodiversité", "Écologie", "Génétique", "Microbiologie", "Statistiques Sociales"],
  "Médecine L1": ["Anatomie", "Physiologie", "Biochimie Médicale", "Histologie", "Biophysique", "Anglais"],
  "Pharmacie L1": ["Chimie Générale", "Biochimie Médicale", "Pharmacologie", "Botanique", "Anatomie"],
  "TSS Biomédical L1": ["Microbiologie Médicale", "Biochimie Médicale", "Anatomie", "Physiologie", "Informatique Générale"],
  "Médecine L2": ["Pathologie", "Sémiologie", "Pharmacologie", "Immunologie", "Santé Publique"],
  "Histoire-Géographie L1": ["Histoire Contemporaine", "Géographie Humaine", "Méthodologie SH", "Anglais", "Informatique Générale"],
  "Archéologie L2": ["Archéologie Africaine", "Histoire Contemporaine", "Géographie Humaine", "Méthodologie SH"],
  "Philosophie L1": ["Philosophie Générale", "Épistémologie", "Histoire Contemporaine", "Anglais"],
  "Sociologie L2": ["Sociologie Générale", "Démographie", "Statistiques Sociales", "Méthodologie SH"],
  "Lettres Modernes L1": ["Littérature Africaine", "Linguistique Générale", "Stylistique", "Anglais LAC"],
  "Linguistique L2": ["Linguistique Générale", "Didactique du Français", "Littérature Africaine", "Anglais LAC"],
  "Communication L1": ["Théories de la Communication", "Journalisme", "Linguistique Générale", "Anglais", "Informatique Générale"],
  "Arts & Culture L2": ["Arts du Spectacle", "Littérature Africaine", "Histoire Contemporaine", "Anglais LAC"],
  "Marketing IBAM L1": ["Comptabilité", "Entrepreneuriat", "Droit Constitutionnel", "Informatique Générale", "Anglais"],
  "Population M1 ISSP": ["Démographie", "Statistiques Sociales", "Santé Publique", "Méthodologie SH", "Anglais"],
};

// Enseignants par UFR -> matières qu'ils peuvent enseigner (simplifié)
const teacherExpertise = {
  SEA: {
    "b.ouedraogo@ujkz.bf": ["Algorithmique 1", "Programmation C", "Analyse 1"],
    "a.traore@ujkz.bf": ["Algèbre 1", "Analyse 1", "Statistiques"],
    "m.kabore@ujkz.bf": ["Bases de données", "Génie Logiciel", "Programmation Python"],
    "f.sawadogo@ujkz.bf": ["Réseaux 1", "Systèmes d'Exploitation", "Cloud Computing"],
    "i.zongo@ujkz.bf": ["Physique 1 - Mécanique", "Physique 2 - Électromagnétisme"],
    "a.nikiema@ujkz.bf": ["Chimie Générale", "Chimie Organique"],
    "s.compaore@ujkz.bf": ["Intelligence Artificielle", "Statistiques", "Mathématiques Discrètes"],
    "m.ilboudo@ujkz.bf": ["Architecture des Ordinateurs", "Systèmes d'Exploitation"],
    "p.dubois@ujkz.bf": ["Anglais Scientifique", "Anglais"],
    "c.smith@ujkz.bf": ["Anglais Scientifique", "Méthodologie Universitaire"],
  },
  SVT: {
    "s.ouattara@ujkz.bf": ["Biologie Cellulaire", "Génétique"],
    "w.djigma@ujkz.bf": ["Microbiologie", "Immunologie"],
    "k.sombie@ujkz.bf": ["Géologie Générale", "Écologie"],
    "i.kiendrebeogo@ujkz.bf": ["Physiologie Végétale", "Botanique"],
    "j.simpore@ujkz.bf": ["Biochimie SVT", "Biodiversité"],
    "r.traore-svt@ujkz.bf": ["Zoologie", "Écologie"],
  },
  SDS: {
    "p.zabsonre@ujkz.bf": ["Anatomie", "Physiologie"],
    "a.kafando@ujkz.bf": ["Pharmacologie", "Biochimie Médicale"],
    "a.kone@ujkz.bf": ["Sémiologie", "Pathologie"],
    "b.diallo@ujkz.bf": ["Santé Publique", "Parasitologie"],
    "n.coulibaly@ujkz.bf": ["Histologie", "Immunologie"],
    "h.sombie-sds@ujkz.bf": ["Microbiologie Médicale", "Biochimie Médicale"],
    "f.yameogo@ujkz.bf": ["Biophysique", "Physiologie"],
    "a.sanou@ujkz.bf": ["Anatomie", "Pathologie"],
  },
  SH: {
    "y.bambara@ujkz.bf": ["Histoire Contemporaine", "Archéologie Africaine"],
    "s.ouattara-sh@ujkz.bf": ["Géographie Humaine", "Démographie"],
    "m.kafando-sh@ujkz.bf": ["Philosophie Générale", "Épistémologie"],
    "a.sore@ujkz.bf": ["Sociologie Générale", "Méthodologie SH"],
  },
  LAC: {
    "v.rouamba@ujkz.bf": ["Littérature Africaine", "Stylistique"],
    "i.traore-lac@ujkz.bf": ["Linguistique Générale", "Didactique du Français"],
    "b.kabre@ujkz.bf": ["Théories de la Communication", "Journalisme"],
    "d.guigma@ujkz.bf": ["Arts du Spectacle", "Littérature Africaine"],
    "s.sawadogo-lac@ujkz.bf": ["Anglais LAC", "Anglais"],
    "jp.bayala@ujkz.bf": ["Anglais LAC", "Méthodologie Universitaire"],
  },
  IBAM: { "o.koanda@ujkz.bf": ["Comptabilité", "Entrepreneuriat", "Droit Constitutionnel"] },
  IGEDD: { "r.yamba@ujkz.bf": ["Écologie", "Biodiversité"] },
  ISSP: { "l.tapsoba@ujkz.bf": ["Démographie", "Statistiques Sociales", "Santé Publique"] },
  CUPK: { "e.da@ujkz.bf": ["Informatique Générale", "Méthodologie Universitaire"] },
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

async function main() {
  await ensureDatabase();
  const db = new pg.Client({ connectionString: DATABASE_URL });
  await db.connect();
  const schema = readFileSync(join(__dirname, "..", "lib", "schema.sql"), "utf8");
  await db.query(schema);
  console.log("Schéma appliqué.");

  // Reset complet
  console.log("Suppression des données existantes...");
  await db.query(`TRUNCATE users, classes, subjects, class_subjects, teacher_subjects, slots, slot_professors, swap_requests, sessions CASCADE`);
  console.log("Données supprimées.");

  // Directeur
  const directorHash = hashPassword(DIRECTOR_PASSWORD);
  const { rows: [directorRow] } = await db.query(
    `INSERT INTO users (name, email, password_hash, role, first_name, last_name, is_active)
     VALUES ($1,$2,$3,'director',$4,$5,true) RETURNING id`,
    [director.name, director.email, directorHash, director.first_name, director.last_name]
  );
  console.log(`Directeur: ${director.email} / ${DIRECTOR_PASSWORD} (${directorRow.id})`);

  // Enseignants
  const teacherIds = {};
  const teacherByEmail = {};
  for (const t of teachers) {
    const name = `${t.last} ${t.first}`;
    const hash = hashPassword(TEACHER_PASSWORD);
    const { rows } = await db.query(
      `INSERT INTO users (name, email, password_hash, role, first_name, last_name, is_active)
       VALUES ($1,$2,$3,'teacher',$4,$5,$6) RETURNING id`,
      [name, t.email, hash, t.first, t.last, t.active]
    );
    teacherIds[t.email] = rows[0].id;
    teacherByEmail[t.email] = { ...t, id: rows[0].id, name };
  }
  console.log(`${Object.keys(teacherIds).length} enseignants créés (mdp: ${TEACHER_PASSWORD})`);

  // Classes
  const classIds = {};
  for (const c of classes) {
    const { rows } = await db.query(`INSERT INTO classes (name, level) VALUES ($1,$2) RETURNING id`, [c.name, c.level]);
    classIds[c.name] = rows[0].id;
  }
  console.log(`${classes.length} classes créées`);

  // Subjects
  const subjectIds = {};
  for (const s of subjects) {
    const { rows } = await db.query(`INSERT INTO subjects (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id`, [s]);
    subjectIds[s] = rows[0].id;
  }
  console.log(`${subjects.length} matières créées`);

  // class_subjects
  let csCount = 0;
  for (const [cls, subs] of Object.entries(classSubjectsMap)) {
    for (const sub of subs) {
      if (!subjectIds[sub] || !classIds[cls]) continue;
      await db.query(`INSERT INTO class_subjects (class_id, subject_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [classIds[cls], subjectIds[sub]]);
      csCount++;
    }
  }
  console.log(`${csCount} liaisons class_subjects`);

  // teacher_subjects
  let tsCount = 0;
  for (const [ufr, map] of Object.entries(teacherExpertise)) {
    for (const [email, subs] of Object.entries(map)) {
      const tid = teacherIds[email];
      if (!tid) continue;
      for (const sub of subs) {
        // Trouver une classe qui contient cette matière
        const eligibleClasses = classes.filter((c) => (classSubjectsMap[c.name] || []).includes(sub));
        if (eligibleClasses.length === 0) continue;
        // Assigner à 1-2 classes max
        const chosen = shuffle(eligibleClasses).slice(0, Math.min(2, eligibleClasses.length));
        for (const cls of chosen) {
          try {
            await db.query(`INSERT INTO teacher_subjects (teacher_id, subject_id, class_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`, [tid, subjectIds[sub], classIds[cls.name]]);
            tsCount++;
          } catch {}
        }
      }
    }
  }
  // Compléter : s'assurer que chaque couple class_subject a au moins un enseignant
  for (const [clsName, subs] of Object.entries(classSubjectsMap)) {
    for (const sub of subs) {
      const { rowCount } = await db.query(`SELECT 1 FROM teacher_subjects WHERE class_id=$1 AND subject_id=$2`, [classIds[clsName], subjectIds[sub]]);
      if (rowCount === 0) {
        // Assigner un enseignant de l'UFR de la classe au hasard
        const clsUfr = classes.find((c) => c.name === clsName).ufr;
        const candidates = teachers.filter((t) => t.ufr === clsUfr && t.active);
        const chosen = candidates.length ? pick(candidates) : pick(teachers.filter((t) => t.active));
        await db.query(`INSERT INTO teacher_subjects (teacher_id, subject_id, class_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`, [teacherIds[chosen.email], subjectIds[sub], classIds[clsName]]);
        tsCount++;
      }
    }
  }
  console.log(`${tsCount} teacher_subjects`);

  // Slots — emploi du temps réaliste 2024-25 et 2025-26
  // Bandes : 07:00-09:30, 09:30-12:30, 15:00-18:00  (colle aux 2 bandes PDF)
  const bandSlots = [
    { start: "07:00", end: "09:30" },
    { start: "09:30", end: "12:30" },
    { start: "15:00", end: "18:00" },
  ];
  const days = [0, 1, 2, 3, 4, 5]; // Lun-Sam

  // Jours où chaque classe a cours (réaliste : 4j/6 en moyenne)
  let slotCount = 0;
  const now = new Date();
  for (const cls of classes) {
    const subs = classSubjectsMap[cls.name] || [];
    // 4-5 jours occupés par classe
    const activeDays = shuffle(days).slice(0, 4 + Math.floor(Math.random() * 2));
    for (const day of activeDays) {
      // 2-3 créneaux par jour actif
      const nbSlots = 2 + Math.floor(Math.random() * 2); // 2 ou 3
      const chosenBands = shuffle(bandSlots).slice(0, nbSlots);
      for (const band of chosenBands) {
        const subject = pick(subs);
        // Trouver un enseignant habilité
        const { rows: tRows } = await db.query(
          `SELECT teacher_id FROM teacher_subjects WHERE class_id=$1 AND subject_id=$2 LIMIT 5`,
          [classIds[cls.name], subjectIds[subject]]
        );
        let teacherId, teacherEmail;
        if (tRows.length > 0) {
          const r = pick(tRows);
          teacherId = r.teacher_id;
          teacherEmail = Object.entries(teacherIds).find(([, id]) => id === teacherId)?.[0];
        } else {
          const fallback = pick(teachers.filter((t) => t.active));
          teacherId = teacherIds[fallback.email];
          teacherEmail = fallback.email;
        }
        const types = ["cours", "cours", "cours", "td", "td", "tp", "devoir"];
        let type = pick(types);
        // Devoirs surtout samedi
        if (day !== 5 && type === "devoir" && Math.random() < 0.7) type = "cours";
        if (day === 5 && Math.random() < 0.35) type = "devoir";

        // Dates passées + actuelles : created_at aléatoire sur 2 ans
        const pastDays = Math.floor(Math.random() * 700); // ~2 ans
        const createdAt = new Date(now);
        createdAt.setDate(now.getDate() - pastDays);
        // Garder l'heure au hasard
        createdAt.setHours(7 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));

        const { rows } = await db.query(
          `INSERT INTO slots (class_id, subject_id, type, day_of_week, start_time, end_time, creator_teacher_id, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
          [classIds[cls.name], subjectIds[subject], type, day, band.start, band.end, teacherId, createdAt.toISOString()]
        );
        const slotId = rows[0].id;
        // Prof principal
        await db.query(`INSERT INTO slot_professors (slot_id, teacher_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [slotId, teacherId]);
        // 12% co-enseignement
        if (Math.random() < 0.12) {
          const coCandidates = teachers.filter((t) => t.active && teacherIds[t.email] !== teacherId);
          const co = pick(coCandidates);
          // Vérifier qu'il enseigne la matière ou au moins la classe
          await db.query(`INSERT INTO slot_professors (slot_id, teacher_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [slotId, teacherIds[co.email]]);
        }
        slotCount++;
      }
    }
  }
  console.log(`${slotCount} slots créés`);

  // Slots supplémentaires historiques 2024-25 (plus légers, pour avoir du passé)
  // On a déjà varié created_at, donc pas besoin de dupliquer — mais on ajoute quelques remplacements d'enseignants
  // Swap requests réalistes
  const { rows: allSlots } = await db.query(`SELECT id, class_id, subject_id, start_time, end_time, day_of_week, creator_teacher_id FROM slots ORDER BY random() LIMIT 30`);
  const allSubjectIds = Object.values(subjectIds);
  let swapCount = 0;
  for (let i = 0; i < 10; i++) {
    const slot = allSlots[i];
    if (!slot) break;
    // Enseignant demandeur différent du créateur
    const requester = pick(teachers.filter((t) => teacherIds[t.email] !== slot.creator_teacher_id && t.active));
    const proposedSubject = pick(allSubjectIds.filter((id) => id !== slot.subject_id));
    const status = pick(["pending", "pending", "approved", "rejected"]);
    const createdAt = new Date(now);
    createdAt.setDate(now.getDate() - Math.floor(Math.random() * 30));
    try {
      await db.query(
        `INSERT INTO swap_requests (slot_id, requesting_teacher_id, message, proposed_subject_id, proposed_start_time, proposed_end_time, status, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [slot.id, teacherIds[requester.email], `Demande d'échange pour convenance personnelle - ${pick(["Cours avancé","Contrainte médicale","Mission de recherche","Formation"])}`, proposedSubject, "08:00", "10:00", status, createdAt.toISOString()]
      );
      swapCount++;
    } catch {}
  }
  console.log(`${swapCount} swap_requests`);

  // Stats finales
  const { rows: [u] } = await db.query(`SELECT count(*)::int as c FROM users`);
  const { rows: [c] } = await db.query(`SELECT count(*)::int as c FROM classes`);
  const { rows: [s] } = await db.query(`SELECT count(*)::int as c FROM subjects`);
  const { rows: [cs] } = await db.query(`SELECT count(*)::int as c FROM class_subjects`);
  const { rows: [ts] } = await db.query(`SELECT count(*)::int as c FROM teacher_subjects`);
  const { rows: [sl] } = await db.query(`SELECT count(*)::int as c FROM slots`);
  console.log(`\n=== Seed UJKZ terminé ===\n users:${u.c} classes:${c.c} subjects:${s.c} class_subjects:${cs.c} teacher_subjects:${ts.c} slots:${sl.c}`);
  console.log(`Directeur: ${director.email} / ${DIRECTOR_PASSWORD}`);
  console.log(`Enseignants: ${TEACHER_PASSWORD} (tous)`);
  console.log(`Exemple: b.ouedraogo@ujkz.bf / ${TEACHER_PASSWORD}`);

  await db.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
