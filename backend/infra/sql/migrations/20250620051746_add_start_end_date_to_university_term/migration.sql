-- AlterTable
ALTER TABLE "UniversityTerm" ADD COLUMN     "endDate" DATE,
ADD COLUMN     "startDate" DATE,
ALTER COLUMN "name" DROP NOT NULL;
