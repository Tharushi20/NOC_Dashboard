import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import multer from 'multer';

import problemRoutes from './routes/Problem.js';
import authRoutes from './routes/auth.js';
import emailRoutes from './routes/email.js';
import ticketRoutes from './routes/tickets.js';
import RecipientGroup from './models/RecipientGroup.js';
import { ensureCriticalAlertConnectionReady } from './db/criticalAlertConnection.js';

dotenv.config();

const app = express();

// Allow frontend access
app.use(cors());
app.use(express.json());

// Serve static files (for legacy critical alert public assets, if any)
app.use(express.static('public'));

// Match legacy behavior for self-signed certs (if used)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// =======================
// MongoDB Connection
// =======================
// Existing Problem Library connection (kept intact)
mongoose.connect(process.env.MONGO_URI1)
  .then(async () => {
    console.log('Connected to MongoDB (Problem Library / shared DB)');
  })
  .catch(err => console.error('MongoDB connection error:', err));

// =======================
// Critical Alert DB init (using URI2 / MONGODB_URI) - does NOT affect other modules
// =======================
(async () => {
  if (!process.env.MONGODB_URI && !process.env.MONGO_URI2) {
    console.warn('Critical Alert DB URI not set (MONGODB_URI or MONGO_URI2). Skipping recipient-group seeding.');
    return;
  }

  try {
    // If a helper exists, ensure Critical Alert connection is ready (separate connection, uses URI2)
    if (typeof ensureCriticalAlertConnectionReady === 'function') {
      await ensureCriticalAlertConnectionReady();
    }

    // Remove legacy indexes (e.g. unique ip_1) so seeding doesn't fail
    await RecipientGroup.syncIndexes();

    const groups = [
      { name: "Access Switch - PLC_GIT", to: "asanka.chandana@groupit.hayleys.com;deemantha.weerakoon@groupit.hayleys.com", cc: "noc@groupit.hayleys.com" },
      { name: "Access Switch - PLC_ESD", to: "asanka.chandana@groupit.hayleys.com;deemantha.weerakoon@groupit.hayleys.com", cc: "noc@groupit.hayleys.com" },
      { name: "Access Switch - PLC_SECRETARIAL", to: "asanka.chandana@groupit.hayleys.com;deemantha.weerakoon@groupit.hayleys.com", cc: "noc@groupit.hayleys.com" },
      { name: "Access Switch - PLC_FINANCE", to: "asanka.chandana@groupit.hayleys.com;deemantha.weerakoon@groupit.hayleys.com", cc: "noc@groupit.hayleys.com" },
      { name: "Access Switch - PLC_CPMD", to: "asanka.chandana@groupit.hayleys.com;deemantha.weerakoon@groupit.hayleys.com", cc: "noc@groupit.hayleys.com" },
      { name: "Access Switch - PLC_GHR", to: "asanka.chandana@groupit.hayleys.com;deemantha.weerakoon@groupit.hayleys.com", cc: "noc@groupit.hayleys.com" },
      { name: "Access Switch - PLC_SPDU", to: "asanka.chandana@groupit.hayleys.com;deemantha.weerakoon@groupit.hayleys.com", cc: "noc@groupit.hayleys.com" },
      { name: "Access Switch - HO_ROUTER", to: "asanka.chandana@groupit.hayleys.com;deemantha.weerakoon@groupit.hayleys.com", cc: "noc@groupit.hayleys.com" },
      { name: "Access Switch - FL_ROUTER", to: "asanka.chandana@groupit.hayleys.com;deemantha.weerakoon@groupit.hayleys.com", cc: "noc@groupit.hayleys.com" },
      { name: "Access Switch - KVPL", to: "susantha@kvpl.com", cc: "noc@groupit.hayleys.com" },
      { name: "Access Switch - AVENTURA", to: "sandeepa.p@hayleysaventura.com", cc: "noc@groupit.hayleys.com" },
      { name: "Access Switch - DPL_HO", to: "sampath.h@dplgroup.com;indika.wickramaratna@dplgroup.com", cc: "noc@groupit.hayleys.com" },
      { name: "Access Switch - HBSI", to: "dihan.vidanagamage@hayleysbsi.com", cc: "noc@groupit.hayleys.com" },

      { name: "Core Switch - Agro", to: "mariyo.dias@agro.hayleys.com;vipula.ramanayake@agro.hayleys.com;thilina.munasinghe@agro.hayleys.com;dushan.hettiarachchi@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },
      { name: "Core Switch - Alumex", to: "lakmal.kuruppu@alumexgroup.com;dushan.hettiarachchi@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },
      { name: "Core Switch - Aventura", to: "sandeepa.p@hayleysaventura.com;dushan.hettiarachchi@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },
      { name: "Core Switch - Consumer Product", to: "Chathura.Ekanayaka@consumer.hayleys.com;dushan.hettiarachchi@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },
      { name: "Core Switch - DPL", to: "indika.wickramaratna@dplgroup.com;dushan.hettiarachchi@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },
      { name: "Core Switch - Fibre", to: "eco.it@hayleysfibre.com;shirantha.rajakaruna@ravi.hayleys.com;prasanna.kurera@hayleysfibre.com;dushan.hettiarachchi@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },
      { name: "Core Switch - Haycarb", to: "rasika.jayawardena@haycarb.com;mahinda.rajasinghe@haycarb.com;ams@haycarb.com;dushan.hettiarachchi@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },
      { name: "Core Switch - Fabric", to: "chamira.dias@hayleysfabric.com;tharanga.rodrigo@hayleysfabric.com;dushan.hettiarachchi@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },
      { name: "Core Switch - Leisure", to: "shiran.t@hayleysleisure.com;farhaan.f@hayleysleisure.com;dushan.hettiarachchi@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },
      { name: "Core Switch - HBSI", to: "dihan.vidanagamage@hayleysbsi.com;dushan.hettiarachchi@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },
      { name: "Core Switch - Kelani Valley Plantation", to: "susantha@kvpl.com;dushan.hettiarachchi@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },
      { name: "Core Switch - Talawakelle Tea Estate", to: "madhura.suraweera@ttel.hayleys.com;dushan.hettiarachchi@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },

      { name: "Firewall - Agro", to: "mariyo.dias@agro.hayleys.com;vipula.ramanayake@agro.hayleys.com;thilina.munasinghe@agro.hayleys.com;samitha.indika@hayleysfentons.com;dineth.pathirana@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },
      { name: "Firewall - Agro HJS", to: "ranmal.kumara@hjs.hayleys.com;samitha.indika@hayleysfentons.com;dineth.pathirana@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },
      { name: "Firewall - Fiber", to: "eco.it@hayleysfibre.com;shirantha.rajakaruna@ravi.hayleys.com;prasanna.Kurera@hayleysfibre.com;samitha.indika@hayleysfentons.com;dineth.pathirana@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },
      { name: "Firewall - Alumex", to: "lakmal.kuruppu@alumexgroup.com;samitha.indika@hayleysfentons.com;dineth.pathirana@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },
      { name: "Firewall - Amaya", to: "shiran.tissera@hayleysleisure.com;farhaan.fazan@hayleysleisure.com;samitha.indika@hayleysfentons.com;dineth.pathirana@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },
      { name: "Firewall - Advantis", to: "sandun.pasqual@hayleysadvantis.com;samitha.indika@hayleysfentons.com;dineth.pathirana@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },
      { name: "Firewall - Leisure", to: "shiran.t@hayleysleisure.com;farhaan.f@hayleysleisure.com;samitha.indika@hayleysfentons.com;dineth.pathirana@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },
      { name: "Firewall - DPL", to: "indika.wickramaratna@dplgroup.com;samitha.indika@hayleysfentons.com;dineth.pathirana@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },
      { name: "Firewall - Haycarb", to: "rasika.jayawardena@haycarb.com;mahinda.rajasinghe@haycarb.com;ams@haycarb.com;samitha.indika@hayleysfentons.com;dineth.pathirana@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },
      { name: "Firewall - Mabroc Tea", to: "didula.jayasooriya@mabrocteas.com;samitha.indika@hayleysfentons.com;dineth.pathirana@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },
      { name: "Firewall - SAT", to: "sameera.jayakody@satextile.com;samitha.indika@hayleysfentons.com;dineth.pathirana@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },
      { name: "Firewall - External(Palo Alto)", to: "ramya.peiris@hayleysfentons.com;dineth.pathirana@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },
      { name: "Firewall - Internal(Fortigate)", to: "samitha.indika@hayleysfentons.com;dineth.pathirana@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },
      { name: "Firewall - Fabric", to: "chamira.dias@hayleysfabric.com;tharanga.Rodrigo@hayleysfabric.com;dineth.pathirana@hayleysfentons.com;samitha.indika@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },
      { name: "Firewall - HBSI", to: "dihan.Vidanagamage@hayleysbsi.com;samitha.indika@hayleysfentons.com;dineth.pathirana@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },
      { name: "Firewall - Martin Bource", to: "susanthaM@martin-bauer-hayleys.com;yasirul@martin-bauer-hayleys.com;samitha.indika@hayleysfentons.com;dineth.pathirana@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },

      { name: "Avamar", to: "saranga.dissanayake@groupit.hayleys.com;shehan.classen@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },
      { name: "Virtual Machine- V Center", to: "saranga.dissanayake@groupit.hayleys.com;shehan.classen@hayleysfentons.com", cc: "noc@groupit.hayleys.com" },

      { name: "Test - Test", to: "fentons.techsupport@hayleysfentons.com", cc: "fentons.techsupport@hayleysfentons.com" },
      { name: "Test2 - Test2", to: "hansa2001dulaj@gmail.com", cc: "fentonsnoc@gmail.com" },
      { name: "Test3 - Test3", to: "dasanayakeh7@gmail.com", cc: "hansa2001dulaj@gmail.com" }
    ];

    for (const g of groups) {
      await RecipientGroup.findOneAndUpdate(
        { name: g.name },
        g,
        { upsert: true, returnDocument: 'after' }
      );
    }

    console.log('Critical Alert recipient groups initialized');
  } catch (err) {
    console.error('Failed to initialize recipient groups (Critical Alert DB):', err);
  }
})();

// =======================
// Critical Alert DB init (separate DB connection)
// =======================
// NOTE: RecipientGroup/User models are bound to this connection via getCriticalAlertConnection().
// If MONGODB_URI is not set, Critical Alert will not be available, but other modules still run.
// (async () => {
//   if (!process.env.MONGODB_URI && !process.env.MONGO_URI2) {
//     console.warn('Critical Alert DB URI not set (MONGODB_URI or MONGO_URI2). Skipping recipient-group seeding.');
//     return;
//   }

//   try {
//     await ensureCriticalAlertConnectionReady();
//     // Remove legacy indexes from older RecipientGroup schema (e.g. unique `ip_1`)
//     await RecipientGroup.syncIndexes();

//     for (const g of criticalRecipientGroupsSeed) {
//       await RecipientGroup.findOneAndUpdate({ name: g.name }, g, { upsert: true, new: true });
//     }
//     console.log('Critical Alert recipient groups initialized');
//   } catch (err) {
//     console.error('Failed to initialize recipient groups (Critical Alert DB):', err);
//   }
// })();

// =======================
// Multer Setup
// =======================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// =======================
// Routes
// =======================

// Problem Library
app.use('/api/problems', problemRoutes);

// Critical Alert System
app.use('/api/auth', authRoutes);
app.use('/api/email', emailRoutes);

// Open Ticket System
app.use('/api/tickets', ticketRoutes);

// =======================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));