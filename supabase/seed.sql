-- Starter content. Everything here is editable from the admin dashboard.

insert into public.site_settings (key, value) values
('home', jsonb_build_object(
  'hero_title', 'Welcome to IT RAINS MINISTRIES',
  'hero_subtitle', 'Where Heaven''s Abundance Rains Upon Lives.',
  'hero_image_url', null,
  'pastor_name', 'Our Founder & Senior Pastor',
  'pastor_title', 'Founder & Senior Pastor',
  'pastor_photo_url', null,
  'pastor_message', 'Beloved, welcome home. Wherever you are in the world tonight, you are not too far for the presence of God to reach you. At IT RAINS MINISTRIES we believe that heaven is open over every life that turns toward Jesus, and that His goodness falls like rain on the dry places. Come worship with us, pray with us, and grow with us. There is a seat for you in this family.',
  'pastor_bio', 'Share the story of the founder''s calling, ministry journey and family here from the admin dashboard.'
)),
('about', jsonb_build_object(
  'story', 'IT RAINS MINISTRIES is a Spirit-filled, Bible-believing ministry called to bring the abundance of heaven to every nation through worship, prayer, the preaching of the Word and compassionate outreach. What began as a small prayer gathering has grown into a family of believers who meet in person and online from around the world.',
  'vision', 'To see heaven''s abundance rain upon lives, families and nations, raising a generation of worshippers who carry the presence of God into every sphere of society.',
  'mission', 'We exist to preach the Gospel of Jesus Christ, make disciples through sound teaching, cultivate a culture of prayer and worship, care for the broken and the needy, and equip believers for ministry in their communities and across the world.',
  'values', jsonb_build_array('The Word of God','Prayer & Intercession','Spirit-led Worship','Love & Compassion','Excellence & Integrity','Global Mission')
)),
('contact', jsonb_build_object(
  'email', 'info@itrainsministries.org',
  'phone', '+1 000 000 0000',
  'whatsapp', '10000000000',
  'address', 'Add your church address in the admin dashboard',
  'map_query', 'church',
  'office_hours', 'Monday to Friday, 9:00 AM to 5:00 PM'
)),
('social', jsonb_build_object(
  'facebook', '', 'youtube', '', 'instagram', '', 'tiktok', '', 'x', '', 'whatsapp_channel', '', 'telegram', ''
)),
('services', jsonb_build_array(
  jsonb_build_object('day','Sunday','name','Sunday Worship Service','time','9:00 AM','online',true),
  jsonb_build_object('day','Wednesday','name','Midweek Bible Study','time','6:30 PM','online',true),
  jsonb_build_object('day','Friday','name','Friday Prayer Meeting','time','7:00 PM','online',true)
))
on conflict (key) do nothing;

insert into public.departments (slug, name, summary, description, activities, schedule, sort_order) values
('worship', 'Worship & Praise Ministry', 'Leading God''s people into His presence through Spirit-filled worship.',
 'Our worship team of singers, musicians and technicians serves every service and special event, ministering to the heart of God and preparing the atmosphere for His Word.',
 array['Sunday & midweek worship','Worship nights','Choir & instrumental training','Songwriting workshops'], 'Rehearsals Saturdays 4:00 PM', 1),
('prayer', 'Prayer & Intercession Ministry', 'Standing in the gap for the church, families and the nations.',
 'Intercessors cover every service, pray over submitted prayer requests and lead prayer watches for the ministry and the world.',
 array['Daily prayer watch','Friday prayer meeting','Prayer chain for urgent requests','Intercessors'' training'], 'Fridays 7:00 PM, daily watch 5:00 AM', 2),
('evangelism', 'Evangelism & Outreach', 'Taking the Gospel beyond the walls of the church.',
 'We reach our cities with the love of Christ through street evangelism, crusades, hospital and prison visits and digital evangelism.',
 array['Street evangelism','Crusades','Hospital & prison ministry','Online evangelism'], 'Outreach Saturdays 10:00 AM', 3),
('youth', 'Youth Ministry', 'Raising a bold, on-fire generation for Jesus.',
 'A place for teenagers and young adults to grow in faith, discover purpose and build godly friendships.',
 array['Youth services','Youth camps','Mentorship','Campus fellowships'], 'Saturdays 3:00 PM', 4),
('women', 'Women''s Ministry', 'Women of virtue, strength and purpose.',
 'Encouraging women to flourish spiritually, emotionally and practically through fellowship, teaching and service.',
 array['Women''s fellowship','Conferences','Mentoring circles','Community care'], 'First Saturday monthly, 11:00 AM', 5),
('men', 'Men''s Ministry', 'Godly men leading in their homes, church and communities.',
 'Building men of integrity through prayer breakfasts, accountability groups and leadership development.',
 array['Prayer breakfasts','Accountability groups','Men''s retreats','Service projects'], 'Second Saturday monthly, 8:00 AM', 6),
('children', 'Children''s Ministry', 'Planting God''s Word in young hearts.',
 'Safe, joyful and Bible-centred programs that help children know and love Jesus.',
 array['Children''s church','Vacation Bible school','Kids'' worship','Parent resources'], 'Sundays during service', 7),
('marriage-family', 'Marriage & Family Ministry', 'Building strong, Christ-centred homes.',
 'Supporting couples and families through teaching, counseling and fellowship.',
 array['Marriage seminars','Pre-marital counseling','Couples'' fellowship','Parenting classes'], 'Last Saturday monthly, 5:00 PM', 8),
('counseling', 'Pastoral Counseling', 'Compassionate, confidential care from our pastoral team.',
 'Our pastors and trained counselors offer biblical guidance and prayer for life''s challenges. Requests are handled confidentially.',
 array['One-to-one counseling','Grief support','Family counseling','Online sessions'], 'By appointment', 9),
('discipleship', 'Discipleship & Bible Study', 'Growing deep roots in the Word of God.',
 'Structured Bible study and discipleship tracks for new believers and mature Christians alike.',
 array['Wednesday Bible study','New believers'' class','Discipleship tracks','Online study groups'], 'Wednesdays 6:30 PM', 10),
('prophetic', 'Prophetic & Prayer Meetings', 'Encountering God through prayer and the prophetic.',
 'Gatherings dedicated to seeking God''s face, hearing His voice and ministering in the gifts of the Spirit, in order and under pastoral oversight.',
 array['Prophetic prayer nights','Healing services','Night vigils'], 'Monthly, see events', 11),
('missions', 'Missions & Community Development', 'Serving the nations with the love of Christ.',
 'Supporting missionaries, church planting and practical community projects that meet real needs.',
 array['Mission trips','Feeding programs','Education support','Church planting'], 'See events for upcoming trips', 12),
('leadership', 'Leadership & Ministry Training', 'Equipping leaders for the work of ministry.',
 'Training programs that prepare believers to lead with character, competence and the power of the Spirit.',
 array['Leadership school','Ministry internships','Workshops','Mentorship'], 'Quarterly intakes', 13)
on conflict (slug) do nothing;
