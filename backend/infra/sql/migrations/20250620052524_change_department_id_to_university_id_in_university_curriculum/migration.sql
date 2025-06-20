/*
  Warnings:

  - You are about to drop the column `departmentId` on the `UniversityCurriculum` table. All the data in the column will be lost.
  - Added the required column `universityId` to the `UniversityCurriculum` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UniversityCurriculum" DROP CONSTRAINT "UniversityCurriculum_departmentId_fkey";

-- AlterTable
ALTER TABLE "UniversityCurriculum" DROP COLUMN "departmentId",
ADD COLUMN     "universityId" BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE "UniversityCurriculum" ADD CONSTRAINT "UniversityCurriculum_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;
