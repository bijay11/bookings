INSERT INTO users (
  first_name, last_name, email, password, access_level,
  profile_picture, bio, created_at, updated_at,
  phone_number, email_verified, phone_verified, is_host, last_login_at
) VALUES
  ('Alice', 'Anderson', 'alice.anderson@example.com', 'password1', 0, 'default-profile.png', 'Bio for Alice', NOW(), NOW(), '123-456-7890', false, false, false, NOW()),
  ('Bob', 'Brown', 'bob.brown@example.com', 'password2', 0, 'default-profile.png', 'Bio for Bob', NOW(), NOW(), '234-567-8901', false, false, false, NOW()),
  ('Carol', 'Clark', 'carol.clark@example.com', 'password3', 0, 'default-profile.png', 'Bio for Carol', NOW(), NOW(), '345-678-9012', false, false, false, NOW()),
  ('David', 'Davis', 'david.davis@example.com', 'password4', 0, 'default-profile.png', 'Bio for David', NOW(), NOW(), '456-789-0123', false, false, false, NOW()),
  ('Eva', 'Evans', 'eva.evans@example.com', 'password5', 0, 'default-profile.png', 'Bio for Eva', NOW(), NOW(), '567-890-1234', false, false, false, NOW()),
  ('Frank', 'Franklin', 'frank.franklin@example.com', 'password6', 0, 'default-profile.png', 'Bio for Frank', NOW(), NOW(), '678-901-2345', false, false, false, NOW()),
  ('Grace', 'Green', 'grace.green@example.com', 'password7', 0, 'default-profile.png', 'Bio for Grace', NOW(), NOW(), '789-012-3456', false, false, false, NOW()),
  ('Hank', 'Hill', 'hank.hill@example.com', 'password8', 0, 'default-profile.png', 'Bio for Hank', NOW(), NOW(), '890-123-4567', false, false, false, NOW()),
  ('Ivy', 'Irving', 'ivy.irving@example.com', 'password9', 0, 'default-profile.png', 'Bio for Ivy', NOW(), NOW(), '901-234-5678', false, false, false, NOW()),
  ('Jack', 'Johnson', 'jack.johnson@example.com', 'password10', 0, 'default-profile.png', 'Bio for Jack', NOW(), NOW(), '012-345-6789', false, false, false, NOW());
