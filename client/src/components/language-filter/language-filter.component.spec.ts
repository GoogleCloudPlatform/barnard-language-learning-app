import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageFilterComponent } from './language-filter.component';

describe('LanguageFilterComponent', () => {
  let component: LanguageFilterComponent;
  let fixture: ComponentFixture<LanguageFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LanguageFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LanguageFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
