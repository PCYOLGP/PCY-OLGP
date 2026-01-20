CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT,
    bio TEXT,
    image TEXT,
    fname TEXT,
    mname TEXT,
    lname TEXT
);

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    username TEXT REFERENCES users(username) ON UPDATE CASCADE,
    image TEXT,
    caption TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    username TEXT REFERENCES users(username) ON UPDATE CASCADE,
    comment TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS likes (
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

INSERT INTO users (username, password, bio, email, image)
VALUES ('OLGP_PCY', crypt('admin123', gen_salt('bf')), 'Official Admin of OLGP Parish Commission on Youth', 'pcyolgp@gmail.com', '')
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, password, bio, fname, mname, lname, email, image)
VALUES ('user', crypt('user123', gen_salt('bf')), 'Youth Member of OLGP', 'user', '', 'user', '', '')
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, password, bio, fname, mname, lname, email, image)
VALUES ('wencyjezrel23', crypt('wency23', gen_salt('bf')), 'Youth Member of OLGP', 'Wency Jezrel', '', 'Opiso', 'wency.jez@gmail.com', '')
ON CONFLICT (username) DO NOTHING;
