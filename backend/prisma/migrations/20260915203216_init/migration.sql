-- CreateTable
CREATE TABLE "Hero" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroAlias" (
    "id" SERIAL NOT NULL,
    "alias" TEXT NOT NULL,
    "heroId" INTEGER NOT NULL,

    CONSTRAINT "HeroAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroMatchup" (
    "id" SERIAL NOT NULL,
    "heroId" INTEGER NOT NULL,
    "counterHeroId" INTEGER NOT NULL,
    "disadvantage" DOUBLE PRECISION NOT NULL,
    "winRate" DOUBLE PRECISION NOT NULL,
    "matches" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroMatchup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hero_slug_key" ON "Hero"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "HeroAlias_alias_key" ON "HeroAlias"("alias");

-- CreateIndex
CREATE UNIQUE INDEX "HeroMatchup_heroId_counterHeroId_key" ON "HeroMatchup"("heroId", "counterHeroId");

-- AddForeignKey
ALTER TABLE "HeroAlias" ADD CONSTRAINT "HeroAlias_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroMatchup" ADD CONSTRAINT "HeroMatchup_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroMatchup" ADD CONSTRAINT "HeroMatchup_counterHeroId_fkey" FOREIGN KEY ("counterHeroId") REFERENCES "Hero"("id") ON DELETE CASCADE ON UPDATE CASCADE;
