-- DropForeignKey
ALTER TABLE "UniversityRequest" DROP CONSTRAINT "UniversityRequest_universityId_fkey";

-- AlterTable
ALTER TABLE "UniversityRequest" ADD COLUMN     "curriculumId" BIGINT,
ALTER COLUMN "universityId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "UniversityCurriculum" (
    "id" BIGSERIAL NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "departmentId" BIGINT NOT NULL,

    CONSTRAINT "UniversityCurriculum_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UniversityCurriculum" ADD CONSTRAINT "UniversityCurriculum_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "UniversityDepartment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityRequest" ADD CONSTRAINT "UniversityRequest_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityRequest" ADD CONSTRAINT "UniversityRequest_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "UniversityCurriculum"("id") ON DELETE SET NULL ON UPDATE CASCADE;
