 import { motion } from "framer-motion";
 
 const companies = [
   { name: "Google", logo: "G" },
   { name: "Microsoft", logo: "M" },
   { name: "Amazon", logo: "A" },
   { name: "Meta", logo: "M" },
   { name: "Apple", logo: "A" },
   { name: "Netflix", logo: "N" },
   { name: "Flipkart", logo: "F" },
   { name: "Uber", logo: "U" },
 ];
 
 export function CompaniesSection() {
   return (
     <section className="py-16 bg-muted/30 border-y border-border">
       <div className="container">
         <motion.div
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
           className="text-center mb-8"
         >
           <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
             Trusted by top companies worldwide
           </p>
         </motion.div>
 
         <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
           {companies.map((company, index) => (
             <motion.div
               key={company.name}
               initial={{ opacity: 0, scale: 0.8 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.4, delay: index * 0.05 }}
               className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
             >
               <div className="h-10 w-10 rounded-lg bg-card border border-border flex items-center justify-center font-bold text-lg">
                 {company.logo}
               </div>
               <span className="font-medium hidden sm:block">{company.name}</span>
             </motion.div>
           ))}
         </div>
       </div>
     </section>
   );
 }