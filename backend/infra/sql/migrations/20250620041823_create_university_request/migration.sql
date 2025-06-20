-- CreateTable
CREATE TABLE "UniversityRequest" (
    "id" BIGSERIAL NOT NULL,
    "universityId" BIGINT NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "content" TEXT NOT NULL,
    "variables" JSONB NOT NULL,

    CONSTRAINT "UniversityRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UniversityRequest" ADD CONSTRAINT "UniversityRequest_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
