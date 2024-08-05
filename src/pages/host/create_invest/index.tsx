import Layout from "@/components/layout/layout";
import PageTitle from "@/components/pageTitle/pageTitle";
import {useTranslation} from "react-i18next";
import CreateCarInvestment from "@/components/investment/createInvestment";

export default function CreateInvest() {
    const {t} = useTranslation();

    return (
        <Layout>
            <div className="flex flex-col">
                <PageTitle title={"Create investment"}/>

                <CreateCarInvestment
                    t={t}
                />
            </div>
        </Layout>
    );
}
