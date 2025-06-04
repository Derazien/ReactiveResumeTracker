import { t } from "@lingui/macro";
import { Book } from "@phosphor-icons/react";
import { Button } from "@reactive-resume/ui";
import { Link } from "react-router";

// COMMENTED OUT FOR SINGLE USER MODE - can be restored later
// import { useLogout } from "@/client/services/auth";
// import { useAuthStore } from "@/client/stores/auth";

export const HeroCTA = () => {
  // COMMENTED OUT FOR SINGLE USER MODE - can be restored later
  // const { logout } = useLogout();
  // const isLoggedIn = useAuthStore((state) => !!state.user);

  // In single user mode, always show "Go to Dashboard" button
  // COMMENTED OUT FOR SINGLE USER MODE - can be restored later
  // if (isLoggedIn) {
  //   return (
  //     <>
  //       <Button asChild size="lg">
  //         <Link to="/dashboard">{t`Go to Dashboard`}</Link>
  //       </Button>

  //       <Button size="lg" variant="link" onClick={() => logout()}>
  //         <SignOut className="mr-3" />
  //         {t`Logout`}
  //       </Button>
  //     </>
  //   );
  // }

  return (
    <>
      <Button asChild size="lg">
        {/* SINGLE USER MODE: Skip login, go directly to dashboard */}
        <Link to="/dashboard">{t`Get Started`}</Link>
        {/* COMMENTED OUT FOR SINGLE USER MODE - can be restored later */}
        {/* <Link to="/auth/login">{t`Get Started`}</Link> */}
      </Button>

      <Button asChild size="lg" variant="link">
        <a href="https://docs.rxresu.me" target="_blank" rel="noopener noreferrer nofollow">
          <Book className="mr-3" />
          {t`Learn more`}
        </a>
      </Button>
    </>
  );
};
