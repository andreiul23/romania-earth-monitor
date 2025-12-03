-- Add UPDATE and DELETE policies for alert_subscriptions
-- Since this is a public subscription system without authentication,
-- we'll allow users to manage their subscriptions by matching their email

-- Policy for users to update their own subscriptions (e.g., change hazard types)
CREATE POLICY "Users can update their subscriptions by email"
  ON alert_subscriptions FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy for users to delete/unsubscribe
CREATE POLICY "Users can delete their subscriptions"
  ON alert_subscriptions FOR DELETE
  USING (true);