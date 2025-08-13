import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AdminSettingsComponent } from './admin-settings.component';
import { SyncService } from '../../../services/admin/sync.service';

describe('AdminSettingsComponent', () => {
  let component: AdminSettingsComponent;
  let fixture: ComponentFixture<AdminSettingsComponent>;
  let syncService: jasmine.SpyObj<SyncService>;

  beforeEach(async () => {
    const syncServiceSpy = jasmine.createSpyObj('SyncService', [
      'syncCategories',
      'syncCountries', 
      'syncMovies',
      'parallelSyncMovies',
      'cleanAllMovies'
    ]);

    await TestBed.configureTestingModule({
      imports: [AdminSettingsComponent, HttpClientTestingModule],
      providers: [
        { provide: SyncService, useValue: syncServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSettingsComponent);
    component = fixture.componentInstance;
    syncService = TestBed.inject(SyncService) as jasmine.SpyObj<SyncService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 5 main sync functions', () => {
    expect(component.syncCategories).toBeDefined();
    expect(component.syncCountries).toBeDefined();
    expect(component.syncMovies).toBeDefined();
    expect(component.parallelSyncMovies).toBeDefined();
    expect(component.cleanAllMovies).toBeDefined();
  });

  it('should manage loading states', () => {
    expect(component.isLoading('test')).toBeFalse();
    component['setLoading']('test', true);
    expect(component.isLoading('test')).toBeTrue();
  });

  it('should manage messages', () => {
    expect(component.getMessage('test')).toBe('');
    component['setMessage']('test', 'Test message', 'success');
    expect(component.getMessage('test')).toBe('Test message');
  });
});
