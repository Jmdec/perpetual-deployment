"use client";

import { useState } from "react";
import MemberLayout from "@/components/memberLayout";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";

interface Section {
    title: string;
    content: string;
}

const handbookSections: Section[] = [
    {
        title: "Tenets and Codes of Conduct",
        content: `
            As a member of The Tau Gamma Phi TRISKELION’S Grand Fraternity, you are expected to uphold the following tenets:

            1. Honor
            - Maintain honesty and integrity in all your actions.
            - Represent the fraternity positively in public and private settings.

            2. Loyalty
            - Demonstrate unwavering loyalty to your brothers and the organization.
            - Support fraternity activities and initiatives consistently.

            3. Brotherhood
            - Foster strong bonds among members through cooperation, respect, and support.
            - Engage in mentorship and guidance for new members.

            4. Integrity
            - Uphold ethical standards and make principled decisions.
            - Avoid misconduct, dishonesty, or behavior that harms the fraternity’s reputation.

            5. Service
            - Contribute to the community through organized fraternity projects.
            - Participate in initiatives that help fellow members and society.

            Violations of these codes can lead to disciplinary action, including warnings, suspension, or revocation of membership. Respect, discipline, and integrity are the core of our brotherhood.
    `,
    },
    {
        title: "Fraternity Constitution",
        content: `
            The Constitution governs the structure, governance, and operations of the fraternity:

            1. Structure
            - Supreme Council: the highest governing body responsible for decision-making.
            - Chapter Officers: manage chapter-level administration.
            - General Members: uphold fraternity principles and participate in events.

            2. Rights and Responsibilities
            - Members have the right to vote on chapter matters and participate in events.
            - Members must attend meetings, adhere to codes, and participate in projects.

            3. Governance Processes
            - Elections are held annually for officer positions.
            - Amendments to the constitution require a two-thirds vote of the Supreme Council.

            4. Discipline
            - Misconduct is handled through a disciplinary committee.
            - Appeals may be submitted to the Supreme Council.

            Members must abide by the Constitution to maintain good standing within the fraternity.
    `,
    },
    {
        title: "Chapter House Rules",
        content: `
            Chapter house rules ensure safety, respect, and harmony among members:

            1. Attendance
            - Members must attend all mandatory meetings and chapter events.
            - Absences must be communicated and excused in advance.

            2. Respect
            - Treat fellow members, alumni, and guests with courtesy.
            - Maintain a safe and welcoming environment at all times.

            3. Maintenance
            - Keep chapter facilities clean and orderly.
            - Report damages or issues to chapter officers immediately.

            4. Conduct
            - Hazing, bullying, or any form of abuse is strictly prohibited.
            - Substance abuse is not allowed within the chapter premises.

            5. Accountability
            - Members must report violations of rules to officers.
            - Participation in fraternity activities is a responsibility, not a privilege.

            Following these rules ensures a safe, productive, and honorable chapter environment.
    `,
    },
    {
        title: "By-Laws of the Perpetual Alumni Triskelion Organization",
        content: `
            The By-Laws of the alumni organization guide alumni engagement and responsibilities:

            1. Membership Criteria
            - Only members who have completed their tenure in good standing are eligible.
            - Alumni must uphold fraternity principles even after graduation.

            2. Roles and Responsibilities
            - Alumni may mentor active members.
            - Assist in chapter initiatives and community projects.

            3. Participation
            - Attend alumni meetings, events, and fundraising activities.
            - Contribute expertise and guidance to support the chapter.

            4. Financial Contributions
            - Alumni are encouraged to contribute to fraternity funds for sustainability.
            - Contributions support scholarships, projects, and chapter operations.

            5. Governance
            - Alumni officers are elected annually.
            - Decisions affecting alumni activities require a majority vote.

            Compliance with the by-laws maintains unity, continuity, and the legacy of the fraternity.
    `,
    },];

export default function DigitalHandbookPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleSection = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Add logo if available
        const logoUrl = "/perpetual-logo.png"; // Replace with your logo path
        const img = new Image();
        img.src = logoUrl;

        img.onload = () => {
            const imgWidth = 40;
            const imgHeight = (img.height / img.width) * imgWidth;
            doc.addImage(img, "PNG", pageWidth / 2 - imgWidth / 2, 10, imgWidth, imgHeight);

            // Title
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text("The Tau Gamma Phi TRISKELION’S Grand Fraternity", pageWidth / 2, 60, { align: "center" });
            doc.setFontSize(14);
            doc.setFont("helvetica", "normal");
            doc.text("University of Perpetual Help - Las Piñas Chapter", pageWidth / 2, 70, { align: "center" });

            let yOffset = 90;

            handbookSections.forEach((section, index) => {
                // Check for page break
                if (yOffset > pageHeight - 50) {
                    doc.addPage();
                    yOffset = 20;
                }

                // Section title
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text(`${index + 1}. ${section.title}`, 20, yOffset);
                yOffset += 10;

                // Section content
                doc.setFontSize(12);
                doc.setFont("helvetica", "normal");
                const lines = doc.splitTextToSize(section.content.trim(), 170);
                lines.forEach((line: string) => {
                    if (yOffset > pageHeight - 20) {
                        doc.addPage();
                        yOffset = 20;
                    }
                    doc.text(line, 20, yOffset);
                    yOffset += 6;
                });

                yOffset += 10; // Space between sections
            });

            doc.save("PTAO Digital Handbook.pdf");
        };

        img.onerror = () => {
            // Fallback if logo fails to load
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text("The Tau Gamma Phi TRISKELION’S Grand Fraternity", pageWidth / 2, 20, { align: "center" });
            doc.setFontSize(14);
            doc.setFont("helvetica", "normal");
            doc.text("University of Perpetual Help - Las Piñas Chapter", pageWidth / 2, 30, { align: "center" });

            let yOffset = 50;

            handbookSections.forEach((section, index) => {
                if (yOffset > pageHeight - 50) {
                    doc.addPage();
                    yOffset = 20;
                }

                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text(`${index + 1}. ${section.title}`, 20, yOffset);
                yOffset += 10;

                doc.setFontSize(12);
                doc.setFont("helvetica", "normal");
                const lines = doc.splitTextToSize(section.content.trim(), 170);
                lines.forEach((line: string) => {
                    if (yOffset > pageHeight - 20) {
                        doc.addPage();
                        yOffset = 20;
                    }
                    doc.text(line, 20, yOffset);
                    yOffset += 6;
                });

                yOffset += 10;
            });

            doc.save("PTAO Digital Handbook.pdf");
        };
    };

    return (
        <MemberLayout>
            <div className="min-h-screen">
                {/* Header */}
                <header className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-10 shadow-md">
                    <div className="px-6 py-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold">Digital Handbook</h1>
                            <p className="text-sm sm:text-base opacity-90">Tau Gamma Phi TRISKELION’S Grand Fraternity</p>
                        </div>
                        <Button
                            onClick={downloadPDF}
                            className="flex items-center gap-2 bg-white hover:bg-gray-100 text-red-600 font-semibold px-4 py-2 rounded-lg transition-colors"
                        >
                            <Download className="w-5 h-5" />
                            Download PDF
                        </Button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                    <div className="text-center mb-8">
                        <h2 className="text-xl font-semibold text-gray-800">University of Perpetual Help - Las Piñas Chapter</h2>
                        <p className="text-gray-600 mt-2">Explore the sections below for detailed information.</p>
                    </div>

                    {handbookSections.map((section, index) => (
                        <Card key={index} className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-red-500">
                            <CardHeader
                                className="flex justify-between items-center cursor-pointer p-6 hover:bg-gray-100 transition-colors"
                                onClick={() => toggleSection(index)}
                            >
                                <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-500 mr-2"> {openIndex === index ? '' : ''}</span>
                                    {openIndex === index ? (
                                        <ChevronUp className="w-6 h-6 text-gray-600" />
                                    ) : (
                                        <ChevronDown className="w-6 h-6 text-gray-600" />
                                    )}
                                </div>
                            </CardHeader>
                            {openIndex === index && (
                                <CardContent className="p-6 text-gray-700 leading-relaxed whitespace-pre-line">
                                    {section.content}
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </main>
            </div>
        </MemberLayout>
    );
}