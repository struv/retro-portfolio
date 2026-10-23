// Single source of truth for the project showcase. The front-page card strip,
// the detail overlay, and (later) the WebGL slider all read from this list.
// Order here is display order.
//
// Fields:
//   id            stable key, also used for data-project attributes
//   category      'professional' | 'academic' | 'personal'
//   org / date    shown as the card's meta line when present
//   tagline       one line for the card
//   tech          array, rendered as "A • B • C"
//   cover         card image. Keep these at full resolution: a 2:3 card shows
//                 only ~40% of a landscape screenshot's width, so a 460px card
//                 on a 2x display needs ~2200px of source width to stay sharp
//   focus         [x, y] fractions of the cover the tall card window centres on;
//                 default [0.5, 0] (centre-top)
//   description   paragraphs for the detail overlay
//   note          small print under the description (e.g. the metrics window)
//   screenshots   [{ src, caption }], each with a matching "-thumb.jpg"
//   screenshotNote  shown under the screenshots when present
//   links         [{ label, href }] rendered in the overlay
//   href          personal demos open this page instead of the overlay
(function () {
    'use strict';

    const PROJECTS = [
        {
            id: 'modulo',
            title: 'Modulo',
            category: 'professional',
            org: 'Kids & Teens Medical Group',
            date: '2024–2026',
            tagline: 'Patient intake and communications app that replaced NexHealth across 24 clinic locations.',
            tech: ['TypeScript', 'React', 'Express', 'PostgreSQL', 'Drizzle ORM', 'Vercel'],
            cover: 'img/projects/modulo/dashboard.jpg',
            description: [
                'Built and launched a patient intake and communications application to replace NexHealth. I defined initial requirements around clinic workflows, supported rollout through live demonstrations, and coordinated maintenance with another developer. Staff used it for form packets by visit type, mobile form fill with e-signatures, SMS/email delivery, a messaging inbox, and English/Spanish kiosk check-in.',
                'September 2026: 115 active staff accounts, 3,847 completed form packets, and 24,039 outbound SMS transmissions. Forms were started or packets completed at 24 clinic locations.'
            ],
            note: 'September 1–30, 2026',
            screenshots: [
                { src: 'img/projects/modulo/field-mapper.jpg', caption: 'Field mapper: place fields on any clinic PDF and auto-fill them from patient demographics' },
                { src: 'img/projects/modulo/dashboard.jpg', caption: "Daily appointments across clinics with each family's form progress" },
                { src: 'img/projects/modulo/messages.jpg', caption: 'Two-way SMS inbox: form links go out, families reply, staff answer' },
                { src: 'img/projects/modulo/kiosk-tablet.jpg', caption: "Check-in kiosk: a tablet at each clinic's front desk lets families find their appointment in English or Spanish" },
                { src: 'img/projects/modulo/form-packets.jpg', caption: 'Form packets for each visit type: new patient, newborn, well-child, sports, ADHD, Spanish' }
            ],
            screenshotNote: 'Screens shown with mock data. No patient information.'
        },
        {
            id: 'vaccine-inventory',
            title: 'Vaccine Inventory',
            category: 'professional',
            org: 'Kids & Teens Medical Group',
            date: '2024–2026',
            tagline: "Clinic stock-entry app backed by the reconciliation team's existing Excel workbook.",
            tech: ['TypeScript', 'Excel / SharePoint', 'Vercel'],
            cover: 'img/projects/vaccine-inventory/desktop.jpg',
            description: [
                "Built and maintained a clinic-facing stock-entry app backed by the reconciliation team's existing Excel workbook. I gathered requirements from the team lead and tested the app-to-workbook workflow with him. Added entry duplication for multiple cases and in-app onboarding for new locations; served as the sole support and maintenance owner during my tenure.",
                'A snapshot collected October 13, 2026 showed inventory edits dated September at 21 clinics. The reconciliation team continued comparing stock counts with EMR records in its established workflow.'
            ],
            note: 'September 1–30, 2026',
            screenshots: [
                { src: 'img/projects/vaccine-inventory/desktop.jpg', caption: 'Weekly stock entry by clinic, VFC and private lots' },
                { src: 'img/projects/vaccine-inventory/mobile.jpg', caption: 'Collapsible rows for entry on a phone' },
                { src: 'img/projects/vaccine-inventory/new-location.jpg', caption: 'Onboarding a new clinic location' }
            ],
            screenshotNote: 'Screens shown with mock data. No patient information.'
        },
        {
            id: 'sp-router',
            title: 'Provider Roster Map',
            category: 'professional',
            org: 'Serendib Healthways',
            date: 'March 2026',
            tagline: "Searchable roster and map of a pediatric IPA's provider network across Los Angeles.",
            tech: ['Next.js', 'React', 'TypeScript', 'MapLibre', 'Vercel'],
            cover: 'img/projects/sp-router/map.jpg',
            description: [
                'Built a searchable roster and map for Serendib Healthways, a pediatrician-focused healthcare network and independent practice association (IPA) in Pasadena. Its overseas agents used it to see where network members were located across the Los Angeles area, along with other roster data such as specialty and contract type.',
                'The roster spreadsheet is converted to JSON at build time, and addresses are geocoded in advance with the U.S. Census geocoder. The app offers search, filters by contract, class, specialty, and city, and a table view alongside a MapLibre map that groups providers at the same address.'
            ],
            screenshots: [
                { src: 'img/projects/sp-router/map.jpg', caption: 'Map view: providers sharing an address grouped into one pin, with specialty breakdown' },
                { src: 'img/projects/sp-router/table.jpg', caption: 'Searchable roster with contract, class, specialty, and city filters' }
            ],
            screenshotNote: 'Screens shown with mock data. No patient information.'
        },
        {
            id: 'transfer-dashboard',
            title: 'Transfer Reporting Dashboard',
            category: 'professional',
            org: 'Kids & Teens Medical Group',
            date: '2024–2026',
            tagline: 'Interactive view of Excel transfer reports for weekly reporting used in CEO presentations.',
            tech: ['Python', 'Excel', 'JavaScript'],
            cover: 'img/projects/transfer-dashboard/overview.jpg',
            description: [
                'Delivered an interactive view of Excel-based transfer reports so my manager could review the data for weekly reporting used in CEO presentations. I pulled reports each week; the dashboard and data transformation were implemented, while full automation of report collection remained unfinished.'
            ],
            screenshots: [
                { src: 'img/projects/transfer-dashboard/overview.jpg', caption: 'Transfers by group with period, segment, and % filters' }
            ],
            screenshotNote: 'Screens shown with mock data. No patient information.'
        },
        {
            id: 'scheduling-dashboard',
            title: 'Scheduling Capacity Dashboard',
            category: 'professional',
            org: 'Kids & Teens Medical Group',
            date: '2024–2026',
            tagline: 'Shows scheduling staff which locations need more appointments, by capacity and specialty.',
            tech: ['Next.js', 'TypeScript', 'CSV data'],
            cover: 'img/projects/scheduling-dashboard/grid.jpg',
            description: [
                'Delivered a dashboard used by scheduling staff to identify locations needing more appointments, considering capacity and specialties.'
            ],
            screenshots: [
                { src: 'img/projects/scheduling-dashboard/grid.jpg', caption: 'Forward schedule by office and day, with booking-curve and target controls' },
                { src: 'img/projects/scheduling-dashboard/week.jpg', caption: "Each chip is a provider's booked vs. expected visits; cells tint amber when under-booked, green on target" },
                { src: 'img/projects/scheduling-dashboard/decisions.jpg', caption: 'Decisions drawer ranking Move, Fill, Shorten, and Gap recommendations against historical baselines' }
            ],
            screenshotNote: 'Screens shown with mock data. No patient information.'
        },
        {
            id: 'meta-scan',
            title: 'Meta-Scan',
            category: 'academic',
            org: 'UC Riverside',
            date: 'August 2024',
            tagline: 'Flask app that OCRs scanned UB-04 claim forms into CSV.',
            tech: ['Python', 'Flask', 'Tesseract', 'OpenCV', 'pytest'],
            description: [
                'Led a four-person college team building a Flask app that extracts fields from scanned UB-04 claim forms into CSV, using Tesseract OCR with OpenCV preprocessing. Teammates built the OCR pipeline: form recognition, CSV sectioning, the Flask app, and the OpenCV crop step.',
                'My work: patient and admit/discharge field validation, the pytest validation tests, the tutorial/help pages, and the README.'
            ],
            links: [
                { label: 'View team repository', href: 'https://github.com/CS-179K/Meta-Scan' }
            ]
        },
        {
            id: 'live-chatroom',
            title: 'Live Chatroom',
            category: 'academic',
            org: 'UC Riverside',
            date: 'May–June 2024',
            tagline: 'Express and MongoDB chatroom with rooms, messaging, and Google login.',
            tech: ['JavaScript', 'Node.js', 'Express', 'MongoDB', 'Handlebars'],
            description: [
                'Four-person college team building a chatroom with Express, MongoDB, and Handlebars server-side rendering. I built the rooms and messaging backend, the Mongoose models, and message edit/delete. A teammate added Google OAuth login and message search.'
            ],
            links: [
                { label: 'View team repository', href: 'https://github.com/struv/cs110-final' }
            ]
        },
        {
            id: 'life',
            title: 'Psychedelic Game of Life',
            category: 'personal',
            tagline: "Explore Conway's Game of Life with animated cells, color effects, and preset patterns.",
            tech: ['React', 'JavaScript', 'CSS'],
            cover: 'img/projects/covers/life.jpg',
            href: 'projects/life.html'
        },
        {
            id: 'melody',
            title: 'Melody Maker',
            category: 'personal',
            tagline: 'Generate and play synth melodies, adjust musical settings, and view the audio spectrum.',
            tech: ['React', 'Tone.js', 'Canvas'],
            cover: 'img/projects/covers/melody.jpg',
            href: 'projects/melody.html'
        },
        {
            id: 'todo',
            title: 'Task Manager',
            category: 'personal',
            tagline: "A browser-only task list with priorities, filtering, and search. Tasks are saved in this browser's local storage.",
            tech: ['JavaScript', 'Local storage'],
            cover: 'img/projects/covers/todo.jpg',
            href: 'projects/todo.html'
        },
        {
            id: 'exp',
            title: 'Study Tracker',
            category: 'personal',
            tagline: "Track study tasks with XP and achievements. Progress is saved in this browser's local storage.",
            tech: ['React', 'Local storage'],
            cover: 'img/projects/covers/exp.jpg',
            href: 'projects/exp.html'
        },
        {
            id: 'sorting',
            title: 'Sorting Visualizer',
            category: 'personal',
            tagline: 'Watch six sorting algorithms with adjustable array settings and playback speed.',
            tech: ['JavaScript', 'Canvas'],
            cover: 'img/projects/covers/sorting.jpg',
            href: 'projects/sorting.html'
        },
        {
            id: 'pathfinding',
            title: 'Pathfinding Visualizer',
            category: 'personal',
            tagline: 'Draw walls, place start and end points, and compare A* and Dijkstra pathfinding on a grid.',
            tech: ['React', 'JavaScript'],
            cover: 'img/projects/covers/pathfinding.jpg',
            href: 'projects/pathfinding.html'
        }
    ];

    const CATEGORY_LABEL = {
        professional: 'Work',
        academic: 'School',
        personal: 'Demo'
    };

    window.ProjectsData = {
        list: PROJECTS,
        categoryLabel: CATEGORY_LABEL,
        byId: (id) => PROJECTS.find((p) => p.id === id) || null
    };
})();
