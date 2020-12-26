pm2 start index.js --cron "0 0 * * 1" -- 0 100000 &&
pm2 start index.js --cron "0 0 * * 1" -- 100000 200000 &&
pm2 start index.js --cron "0 0 * * 3" -- 200000 300000 &&
pm2 start index.js --cron "0 0 * * 3" -- 300000 400000 &&
pm2 start index.js --cron "0 0 * * 5" -- 400000 500000 &&
pm2 start index.js --cron "0 0 * * 5" -- 500000 600000 &&
pm2 start index.js --cron "0 0 * * 7" -- 600000 700000 &&
pm2 start index.js --cron "0 0 * * 7" -- 700000 800000 &&
pm2 start index.js --cron "0 0 * * 7" -- 800000 900000 &&
pm2 start index.js --cron "0 0 * * 7" -- 900000 1000000
