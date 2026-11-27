-- The thirteen ministries named by the church. Names only: descriptions, leaders and
-- meeting details are left empty for each ministry leader to write.
insert into public.ministries (slug, name, sort_order) values
  ('childrens-ministry', 'Children’s Ministry', 1),
  ('youth-ministry', 'Youth Ministry', 2),
  ('young-adults', 'Young Adults', 3),
  ('mens-ministry', 'Men’s Ministry', 4),
  ('womens-ministry', 'Women’s Ministry', 5),
  ('marriage-and-family', 'Marriage and Family', 6),
  ('worship-ministry', 'Worship Ministry', 7),
  ('evangelism', 'Evangelism', 8),
  ('missions', 'Missions', 9),
  ('prayer-ministry', 'Prayer Ministry', 10),
  ('media-ministry', 'Media Ministry', 11),
  ('community-outreach', 'Community Outreach', 12),
  ('pastoral-care', 'Pastoral Care', 13)
on conflict (slug) do nothing;
