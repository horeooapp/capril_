-- 1. Ciblez le schéma 'public' (confirmé par vos logs Prisma)
-- 2. Gestion de updated_at : On utilise un trigger pour l'auto-update côté DB

CREATE TABLE "public"."news_tickers" (
    "news_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_tickers_pkey" PRIMARY KEY ("news_id")
);

-- Fonction pour mettre à jour le timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour la table news_tickers
CREATE TRIGGER update_news_tickers_updated_at
    BEFORE UPDATE ON "public"."news_tickers"
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
