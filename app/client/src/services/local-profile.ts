import { IProfileService } from './profile';
import { Profile } from './entities/profile';

export class LocalProfileService implements IProfileService {
  public loadProfile(): Promise<Profile> {
    const serializedProfile = window.localStorage.getItem('profile');
    let profile: Profile|null = null;
    if (serializedProfile) {
      try {
       profile = JSON.parse(serializedProfile);
      } catch (err) {
        console.warn('Error parsing profile', err);
      }
    }
    if (!profile) {
      profile = { termsAgreed: false, introViewed: false };
    }
    return Promise.resolve(profile);
  }

  public saveProfile(profile: Profile): Promise<any> {
    window.localStorage.setItem('profile', JSON.stringify(profile));
    return Promise.resolve(null);
  }
}
