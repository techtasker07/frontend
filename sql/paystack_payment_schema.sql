-- Paystack Payment Service Schema
-- This schema includes tables for managing payments, transactions, and related entities

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Payments table - Main payment records
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reference VARCHAR(255) UNIQUE NOT NULL,
    amount INTEGER NOT NULL, -- Amount in kobo (smallest currency unit)
    currency VARCHAR(3) DEFAULT 'NGN',
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, processing, success, failed, cancelled
    payment_method VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',

    -- Paystack specific fields
    paystack_reference VARCHAR(255),
    paystack_transaction_id VARCHAR(255),
    paystack_authorization_code VARCHAR(255),
    paystack_card_last4 VARCHAR(4),
    paystack_bank VARCHAR(255),
    paystack_account_name VARCHAR(255),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT payments_amount_positive CHECK (amount > 0),
    CONSTRAINT payments_status_valid CHECK (status IN ('pending', 'processing', 'success', 'failed', 'cancelled'))
);

-- Payment items table - For detailed breakdown of what was paid for
CREATE TABLE IF NOT EXISTS payment_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    item_type VARCHAR(100) NOT NULL, -- 'property_listing', 'premium_feature', 'subscription', etc.
    item_id UUID NOT NULL, -- Reference to the actual item (property_id, etc.)
    quantity INTEGER DEFAULT 1,
    unit_price INTEGER NOT NULL, -- Price per unit in kobo
    total_price INTEGER NOT NULL, -- quantity * unit_price in kobo
    description TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT payment_items_quantity_positive CHECK (quantity > 0),
    CONSTRAINT payment_items_unit_price_positive CHECK (unit_price > 0),
    CONSTRAINT payment_items_total_price_positive CHECK (total_price > 0)
);

-- Payment logs table - For tracking payment events and webhooks
CREATE TABLE IF NOT EXISTS payment_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- 'initiated', 'webhook_received', 'verified', 'failed', etc.
    event_data JSONB NOT NULL,
    ip_address INET,
    user_agent TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment refunds table
CREATE TABLE IF NOT EXISTS payment_refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    refund_reference VARCHAR(255) UNIQUE NOT NULL,
    amount INTEGER NOT NULL, -- Amount to refund in kobo
    reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, processing, success, failed

    -- Paystack specific fields
    paystack_refund_id VARCHAR(255),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT payment_refunds_amount_positive CHECK (amount > 0),
    CONSTRAINT payment_refunds_status_valid CHECK (status IN ('pending', 'processing', 'success', 'failed'))
);

-- Payment methods table - For storing saved payment methods
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'card', 'bank_account', etc.
    provider VARCHAR(50) NOT NULL DEFAULT 'paystack',
    provider_payment_method_id VARCHAR(255) UNIQUE,

    -- Card specific fields
    last4 VARCHAR(4),
    brand VARCHAR(50),
    expiry_month INTEGER,
    expiry_year INTEGER,

    -- Bank account specific fields
    bank_name VARCHAR(255),
    account_name VARCHAR(255),
    account_number VARCHAR(20),

    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT payment_methods_expiry_month_valid CHECK (expiry_month IS NULL OR (expiry_month >= 1 AND expiry_month <= 12)),
    CONSTRAINT payment_methods_expiry_year_valid CHECK (expiry_year IS NULL OR expiry_year >= EXTRACT(YEAR FROM NOW()))
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_paystack_reference ON payments(paystack_reference);

CREATE INDEX IF NOT EXISTS idx_payment_items_payment_id ON payment_items(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_items_item_type ON payment_items(item_type);
CREATE INDEX IF NOT EXISTS idx_payment_items_item_id ON payment_items(item_id);

CREATE INDEX IF NOT EXISTS idx_payment_logs_payment_id ON payment_logs(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_event_type ON payment_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON payment_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_payment_refunds_payment_id ON payment_refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_refunds_status ON payment_refunds(status);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_provider_payment_method_id ON payment_methods(provider_payment_method_id);

-- Row Level Security (RLS) policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Payments policies
CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments" ON payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments" ON payments
    FOR UPDATE USING (auth.uid() = user_id);

-- Payment items policies
CREATE POLICY "Users can view their own payment items" ON payment_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM payments
            WHERE payments.id = payment_items.payment_id
            AND payments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own payment items" ON payment_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM payments
            WHERE payments.id = payment_items.payment_id
            AND payments.user_id = auth.uid()
        )
    );

-- Payment logs policies (admin/service role only for security)
CREATE POLICY "Service role can manage payment logs" ON payment_logs
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Payment refunds policies
CREATE POLICY "Users can view their own payment refunds" ON payment_refunds
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM payments
            WHERE payments.id = payment_refunds.payment_id
            AND payments.user_id = auth.uid()
        )
    );

-- Payment methods policies
CREATE POLICY "Users can view their own payment methods" ON payment_methods
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods" ON payment_methods
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods" ON payment_methods
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods" ON payment_methods
    FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one default payment method per user
CREATE OR REPLACE FUNCTION ensure_single_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default THEN
        UPDATE payment_methods
        SET is_default = FALSE
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER ensure_single_default_payment_method_trigger
    BEFORE INSERT OR UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION ensure_single_default_payment_method();

-- Function to log payment status changes
CREATE OR REPLACE FUNCTION log_payment_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO payment_logs (payment_id, event_type, event_data)
        VALUES (NEW.id, 'status_changed', jsonb_build_object(
            'old_status', OLD.status,
            'new_status', NEW.status,
            'changed_at', NOW()
        ));
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER log_payment_status_change_trigger
    AFTER UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION log_payment_status_change();

-- Comments for documentation
COMMENT ON TABLE payments IS 'Main table for storing payment transactions';
COMMENT ON TABLE payment_items IS 'Detailed breakdown of items included in each payment';
COMMENT ON TABLE payment_logs IS 'Audit log for payment events and webhooks';
COMMENT ON TABLE payment_refunds IS 'Records of payment refunds';
COMMENT ON TABLE payment_methods IS 'Saved payment methods for users';

COMMENT ON COLUMN payments.amount IS 'Amount in kobo (smallest currency unit, e.g., 50000 = ₦500.00)';
COMMENT ON COLUMN payments.paystack_reference IS 'Reference returned by Paystack API';
COMMENT ON COLUMN payment_items.unit_price IS 'Price per unit in kobo';
COMMENT ON COLUMN payment_items.total_price IS 'Total price in kobo (quantity * unit_price)';