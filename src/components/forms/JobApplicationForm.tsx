import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  name: z.string().min(2, { message: "İsim en az 2 karakter olmalıdır." }),
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz." }),
  position: z.string().min(2, { message: "İlgilendiğiniz pozisyonu yazınız." }),
  message: z
    .string()
    .min(10, { message: "Mesajınız en az 10 karakter olmalıdır." }),
})

export function JobApplicationForm() {
  const [submitted, setSubmitted] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", position: "", message: "" },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
        <p className="text-lg font-semibold text-emerald-500">
          Başvurunuz alındı!
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Resend altyapısı etkinleştirildiğinde başvurunuz e-posta ile
          info@jetborsa.com adresine iletilecektir.
        </p>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ad Soyad</FormLabel>
              <FormControl>
                <Input placeholder="Adınız Soyadınız" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-posta</FormLabel>
              <FormControl>
                <Input placeholder="E-posta adresiniz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>İlgilendiğiniz Pozisyon</FormLabel>
              <FormControl>
                <Input placeholder="Örn. Yazılım Mühendisi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Neden Bize Katılmalısınız?</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Kendinizden ve deneyiminizden bahsedin."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Başvur
        </Button>
      </form>
    </Form>
  )
}
