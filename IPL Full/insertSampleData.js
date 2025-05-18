const pool = require('./db');

const insertSampleData = async () => {
  try {
// Insert Players for MI
await pool.query(`
INSERT INTO schedule (team1, team2, match_date, venue) VALUES
('KKR', 'RCB', '2025-03-22', 'Eden Gardens, Kolkata'),
('SRH', 'RR', '2025-03-23', 'Rajiv Gandhi International Stadium, Hyderabad'),
('MI', 'CSK', '2025-03-23', 'MA Chidambaram Stadium, Chennai'),
('LSG', 'DC', '2025-03-24', 'Dr. Y.S. Rajasekhara Reddy ACA-VDCA Cricket Stadium, Visakhapatnam'),
('PBKS', 'GT', '2025-03-25', 'Narendra Modi Stadium, Ahmedabad'),
('RR', 'KKR', '2025-03-26', 'Barsapara Cricket Stadium, Guwahati'),
('SRH', 'LSG', '2025-03-27', 'Rajiv Gandhi International Stadium, Hyderabad'),
('RCB', 'CSK', '2025-03-28', 'MA Chidambaram Stadium, Chennai'),
('GT', 'MI', '2025-03-29', 'Narendra Modi Stadium, Ahmedabad'),
('SRH', 'DC', '2025-03-30', 'Dr. Y.S. Rajasekhara Reddy ACA-VDCA Cricket Stadium, Visakhapatnam'),
('RR', 'CSK', '2025-03-30', 'Barsapara Cricket Stadium, Guwahati'),
('KKR', 'MI', '2025-03-31', 'Wankhede Stadium, Mumbai'),
('LSG', 'PBKS', '2025-04-01', 'Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium, Lucknow'),
('RCB', 'GT', '2025-04-02', 'M.Chinnaswamy Stadium, Bengaluru'),
('KKR', 'SRH', '2025-04-03', 'Eden Gardens, Kolkata'),
('LSG', 'MI', '2025-04-04', 'Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium, Lucknow'),
('DC', 'CSK', '2025-04-05', 'MA Chidambaram Stadium, Chennai'),
('RR', 'PBKS', '2025-04-05', 'Maharaja Yadavindra Singh International Cricket Stadium, Mullanpur'),
('SRH', 'GT', '2025-04-06', 'Rajiv Gandhi International Stadium, Hyderabad'),
('RCB', 'MI', '2025-04-07', 'Wankhede Stadium, Mumbai'),
('LSG', 'KKR', '2025-04-08', 'Eden Gardens, Kolkata'),
('PBKS', 'CSK', '2025-04-08', 'Maharaja Yadavindra Singh International Cricket Stadium, Mullanpur'),
('GT', 'RR', '2025-04-09', 'Narendra Modi Stadium, Ahmedabad'),
('RCB', 'DC', '2025-04-10', 'M.Chinnaswamy Stadium, Bengaluru'),
('CSK', 'KKR', '2025-04-11', 'MA Chidambaram Stadium, Chennai'),
('GT', 'LSG', '2025-04-12', 'Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium, Lucknow'),
('PBKS', 'SRH', '2025-04-12', 'Rajiv Gandhi International Stadium, Hyderabad'),
('RR', 'RCB', '2025-04-13', 'Sawai Mansingh Stadium, Jaipur'),
('MI', 'DC', '2025-04-13', 'Arun Jaitley Stadium, Delhi'),
('LSG', 'CSK', '2025-04-14', 'Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium, Lucknow'),
('PBKS', 'KKR', '2025-04-15', 'Maharaja Yadavindra Singh International Cricket Stadium, Mullanpur'),
('DC', 'RR', '2025-04-16', 'Arun Jaitley Stadium, Delhi'),
('SRH', 'MI', '2025-04-17', 'Wankhede Stadium, Mumbai'),
('RCB', 'PBKS', '2025-04-18', 'M.Chinnaswamy Stadium, Bengaluru'),
('DC', 'GT', '2025-04-19', 'Narendra Modi Stadium, Ahmedabad'),
('LSG', 'RR', '2025-04-19', 'Sawai Mansingh Stadium, Jaipur'),
('PBKS', 'RCB', '2025-04-20', 'Maharaja Yadavindra Singh International Cricket Stadium, Mullanpur'),
('CSK', 'MI', '2025-04-20', 'Wankhede Stadium, Mumbai'),
('GT', 'KKR', '2025-04-21', 'Eden Gardens, Kolkata'),
('LSG', 'DC', '2025-04-22', 'Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium, Lucknow'),
('SRH', 'MI', '2025-04-23', 'Rajiv Gandhi International Stadium, Hyderabad'),
('RCB', 'RR', '2025-04-24', 'M.Chinnaswamy Stadium, Bengaluru'),
('CSK', 'SRH', '2025-04-25', 'MA Chidambaram Stadium, Chennai'),
('KKR', 'PBKS', '2025-04-26', 'Eden Gardens, Kolkata'),
('MI', 'LSG', '2025-04-27', 'Wankhede Stadium, Mumbai'),
('DC', 'RCB', '2025-04-27', 'Arun Jaitley Stadium, Delhi'),
('RR', 'GT', '2025-04-28', 'Sawai Mansingh Stadium, Jaipur'),
('DC', 'KKR', '2025-04-29', 'Arun Jaitley Stadium, Delhi'),
('CSK', 'PBKS', '2025-04-30', 'MA Chidambaram Stadium, Chennai'),
('RR', 'MI', '2025-05-01', 'Sawai Mansingh Stadium, Jaipur'),
('GT', 'SRH', '2025-05-02', 'Narendra Modi Stadium, Ahmedabad'),
('RCB', 'CSK', '2025-05-03', 'M.Chinnaswamy Stadium, Bengaluru'),
('KKR', 'RR', '2025-05-04', 'Eden Gardens, Kolkata'),
('PBKS', 'LSG', '2025-05-04', 'Himachal Pradesh Cricket Association Stadium, Dharamsala'),
('SRH', 'DC', '2025-05-05', 'Rajiv Gandhi International Stadium, Hyderabad'),
('MI', 'GT', '2025-05-06', 'Wankhede Stadium, Mumbai'),
('KKR', 'CSK', '2025-05-07', 'Eden Gardens, Kolkata'),
('PBKS', 'DC', '2025-05-08', 'Himachal Pradesh Cricket Association Stadium, Dharamsala'),
('LSG', 'RCB', '2025-05-09', 'Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium, Lucknow'),
('SRH', 'KKR', '2025-05-10', 'Rajiv Gandhi International Stadium, Hyderabad'),
('PBKS', 'MI', '2025-05-11', 'Himachal Pradesh Cricket Association Stadium, Dharamsala'),
('DC', 'GT', '2025-05-11', 'Arun Jaitley Stadium, Delhi'),
('CSK', 'RR', '2025-05-12', 'MA Chidambaram Stadium, Chennai'),
('RCB', 'SRH', '2025-05-13', 'M.Chinnaswamy Stadium, Bengaluru'),
('GT', 'LSG', '2025-05-14', 'Narendra Modi Stadium, Ahmedabad'),
('MI', 'DC', '2025-05-15', 'Wankhede Stadium, Mumbai'),
('RR', 'PBKS', '2025-05-16', 'Sawai Mansingh Stadium, Jaipur'),
('RCB', 'KKR', '2025-05-17', 'M.Chinnaswamy Stadium, Bengaluru'),
('GT', 'CSK', '2025-05-18', 'Narendra Modi Stadium, Ahmedabad'),
('LSG', 'SRH', '2025-05-18', 'Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium, Lucknow');

  `);
  console.log('✅ First batch of players inserted!');
  process.exit();
} catch (error) {
  console.error('❌ Error inserting players:', error);
  process.exit(1);
}
};

insertSampleData();