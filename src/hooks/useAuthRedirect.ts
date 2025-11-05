import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';

/**
 * Custom hook to redirect guests to authentication screens
 * This hook resets the navigation state to show the Auth stack
 */
export const useAuthRedirect = () => {
  const navigation = useNavigation();

  const redirectToAuth = () => {
    try {
      // Get the root navigation object by traversing up the navigation tree
      let rootNavigation = navigation;
      let parent = navigation.getParent();
      
      // Keep traversing up until we find the root navigator
      while (parent) {
        rootNavigation = parent;
        parent = parent.getParent();
      }

      // Try to navigate to Auth screen
      try {
        (rootNavigation as any).navigate('Auth', { screen: 'Login' });
      } catch (navigateError) {
        // If navigation fails, try resetting the navigation state
        try {
          rootNavigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: 'Auth',
                  params: {
                    screen: 'Login',
                  },
                },
              ],
            })
          );
        } catch (resetError) {
          console.error('Failed to redirect to auth:', resetError);
        }
      }
    } catch (error) {
      console.error('Failed to redirect to auth:', error);
    }
  };

  return { redirectToAuth };
};

