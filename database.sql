-- Table Definition ----------------------------------------------

CREATE TABLE admin_user (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text,
    password text
);

CREATE TABLE custom_listings (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title text NOT NULL,
    description text,
    image_link text,
    starting_price numeric(10, 2) NOT NULL
);

CREATE TABLE pre_made_listings (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title text NOT NULL,
    description text,
    image_link text,
    price numeric(10, 2) NOT NULL,
    date_listed date DEFAULT CURRENT_DATE
);

CREATE TABLE customers (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL,
    contact_info text,
    notes text
);

CREATE TABLE pipeline (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    section_name text NOT NULL UNIQUE
);

CREATE TABLE customer_pipeline (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id integer REFERENCES customers(id) ON DELETE CASCADE,
    pipeline_id integer REFERENCES pipeline(id) ON DELETE CASCADE
);

-- Indices -------------------------------------------------------

CREATE UNIQUE INDEX admin_user_pkey ON admin_user(id int4_ops);
CREATE UNIQUE INDEX custom_listings_pkey ON custom_listings(id int4_ops);
CREATE UNIQUE INDEX pre_made_listings_pkey ON pre_made_listings(id int4_ops);
CREATE UNIQUE INDEX customers_pkey ON customers(id int4_ops);
CREATE UNIQUE INDEX pipeline_pkey ON pipeline(id int4_ops);
CREATE UNIQUE INDEX customer_pipeline_pkey ON customer_pipeline(id int4_ops);

-- Insert Pipeline Sections ---------------------------------------

INSERT INTO pipeline (section_name) VALUES
    ('Intake'),
    ('Payment'),
    ('Production'),
    ('Shipping'),
    ('Delivery'),
    ('Completed'),
    ('Cancelled');
